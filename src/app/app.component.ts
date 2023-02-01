import {Component, OnDestroy, OnInit} from '@angular/core';
import {MenuController, Platform} from "@ionic/angular";
import {Subscription} from "rxjs";
import {gymName} from '../environments/environment';
import {AppInfoService} from "./services/app-info.service";
import {DeviceIDService} from "./services/device-id.service";
import {getRemSizeInPixels, inverseLerp, UnsubscribeIfSubscribed} from "./services/app.utility";
import {Themes} from "./classes/app-config";
import {Router} from "@angular/router";
import {AccountService} from "./services/account.service";

const handleColorSchemeChangeEvent = (event: MediaQueryListEvent) => document.body.classList.toggle("dark", event.matches);

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {//TODO Save stuff on firebase based on account, not just randomly (either as an extra field or through collection names)
    private readonly maxMobileWidth = 1024;
    private readonly paddingSizeInRem = 3;
    private sysTheme?: MediaQueryList;

    private resizeSubscription?: Subscription;
    private appConfigSubscription?: Subscription;
    private accountSubscription?: Subscription;
    private deviceIDSubscription?: Subscription;

    public readonly gymName: string = gymName;
    public firebaseResponded: boolean = false;
    public displayUsername: string | null | undefined;
    public deviceName: string | null = null;
    public menuId: string = "menu";
    public isLoadingDeviceName: boolean = true;

    constructor(private platform: Platform, private deviceIDService: DeviceIDService, private router: Router, private accountService: AccountService, private menuController: MenuController) {}

    async ngOnInit() {
        this.GetPlatformInfo();
        await this.SetAppTheme();
        await this.SetDeviceName();
        this.CheckIfUserIsLoggedInAndRedirect();
    }

    async ngOnDestroy() {
        UnsubscribeIfSubscribed(this.resizeSubscription);
        UnsubscribeIfSubscribed(this.appConfigSubscription);
        UnsubscribeIfSubscribed(this.accountSubscription);
        UnsubscribeIfSubscribed(this.deviceIDSubscription);
    }

    GetPlatformInfo() {
        this.PushAppInfoAndSetCSS();
        UnsubscribeIfSubscribed(this.resizeSubscription);
        this.resizeSubscription = this.platform.resize.subscribe(() => {
            this.PushAppInfoAndSetCSS();
        });
    }

    PushAppInfoAndSetCSS() {
        let appInfo = {
            appWidth: this.platform.width(),
            appHeight: this.platform.height(),
            userAgent: navigator.userAgent,
            isMobile: this.platform.width() <= this.maxMobileWidth,
            maxMobileWidth: this.maxMobileWidth
        }
        document.documentElement.style.setProperty("--mobile-max-width", appInfo.maxMobileWidth + "px");
        document.documentElement.style.setProperty("--desktop-padding-top", appInfo?.isMobile ? "0" : ((inverseLerp(appInfo!.appWidth, appInfo!.maxMobileWidth, appInfo!.maxMobileWidth + (getRemSizeInPixels() * (this.paddingSizeInRem + this.paddingSizeInRem))) * this.paddingSizeInRem) + "rem"));
        AppInfoService.PushAppInfo(appInfo);
    }

    async SetAppTheme() {
        this.sysTheme = window.matchMedia("(prefers-color-scheme: dark)");
        await AppInfoService.LoadAppConfig();
        UnsubscribeIfSubscribed(this.appConfigSubscription);
        this.appConfigSubscription = AppInfoService.GetAppConfigObservable().subscribe(appConfig => {
            switch (appConfig.theme) {
                case Themes.MatchSystem:
                    document.body.classList.toggle("dark", this.sysTheme?.matches);
                    this.sysTheme?.addEventListener("change", handleColorSchemeChangeEvent);
                    break;
                case Themes.Dark:
                    this.sysTheme?.removeEventListener("change", handleColorSchemeChangeEvent);
                    document.body.classList.toggle("dark", true);
                    break;
                case Themes.Light:
                    this.sysTheme?.removeEventListener("change", handleColorSchemeChangeEvent);
                    document.body.classList.toggle("dark", false);
                    break;
            }
        });
    }

    async SetDeviceName() {
        await this.deviceIDService.SetDeviceName();
        UnsubscribeIfSubscribed(this.deviceIDSubscription);
        this.deviceIDSubscription = this.deviceIDService.GetDeviceNameObservable().subscribe(deviceName => {
            this.deviceName = deviceName
            this.isLoadingDeviceName = false;
        });
    }

    CheckIfUserIsLoggedInAndRedirect() {
        UnsubscribeIfSubscribed(this.accountSubscription);
        this.accountSubscription = this.accountService.GetUserObservable().subscribe(async (answer) => {
            if (typeof answer == "boolean")//todo test this on a mobile app (loading html offline)
                return;
            this.firebaseResponded = true;
            if (!answer) {
                await this.router.navigate(["/login"]);
                return;
            }
            this.displayUsername = (answer?.displayName) ? answer?.displayName : answer?.email;
            if (this.router.url == "/" || this.router.url == "/login")
                await this.router.navigate(["/home"]);
        });
    }

    async ConfigBtn() {
        await this.menuController.close(this.menuId)
        await this.router.navigate(["/config"]);
    }
}
