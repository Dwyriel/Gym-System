import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MenuController, Platform} from "@ionic/angular";
import {Subscription} from "rxjs";
import {gymName} from '../environments/environment';
import {AppInfoService} from "./services/app-info.service";
import {DeviceIDService} from "./services/device-id.service";
import {UnsubscribeIfSubscribed} from "./services/app.utility";
import {Themes} from "./classes/app-config";
import {Router} from "@angular/router";
import {AccountService} from "./services/account.service";

const handleColorSchemeChangeEvent = (event: MediaQueryListEvent) => document.body.classList.toggle("dark", event.matches);

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
    @ViewChild('SpinnerDiv') SpinnerDivElement?: ElementRef;

    private resizeSubscription?: Subscription;
    private appConfigSubscription?: Subscription;
    private accountSubscription?: Subscription;
    private deviceIDSubscription?: Subscription;

    readonly gymName: string = gymName;
    private sysTheme?: MediaQueryList;

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
        this.PushAppInfo();
        UnsubscribeIfSubscribed(this.resizeSubscription);
        this.resizeSubscription = this.platform.resize.subscribe(() => {
            this.PushAppInfo();
            if (this.firebaseResponded)
                return;
            this.SpinnerDivElement!.nativeElement.style.setProperty("--calculatedOffsetY", ((this.SpinnerDivElement?.nativeElement.offsetHeight / 2) * -1) - 40 + "px");
            this.SpinnerDivElement!.nativeElement.style.setProperty("--calculatedOffsetX", (this.platform.width() >= 600) ? (((this.SpinnerDivElement?.nativeElement.offsetWidth / 2) * -1) + "px") : "-50%");
        });
    }

    PushAppInfo() {
        AppInfoService.PushAppInfo({
            appWidth: this.platform.width(),
            appHeight: this.platform.height(),
            userAgent: navigator.userAgent,
            isMobile: this.platform.width() <= 1024,
            maxMobileWidth: 1024
        });
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
