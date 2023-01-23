import {Component, OnDestroy, OnInit} from '@angular/core';
import {Platform} from "@ionic/angular";
import {Subscription} from "rxjs";
import {AppInfoService} from "./services/app-info.service";
import {DeviceIDService} from "./services/device-id.service";
import {UnsubscribeIfSubscribed} from "./services/app.utility";
import {Themes} from "./classes/app-config";

const handleColorSchemeChangeEvent = (event: MediaQueryListEvent) => document.body.classList.toggle("dark", event.matches);

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

    private resizeSubscription?: Subscription;
    private appConfigSubscription?: Subscription;

    private sysTheme?: MediaQueryList;

    constructor(private platform: Platform, private deviceIDService: DeviceIDService) {}

    async ngOnInit() {
        this.GetPlatformInfo();
        await this.SetAppTheme();
        await this.deviceIDService.SetDeviceName();
    }

    async ngOnDestroy() {
        UnsubscribeIfSubscribed(this.resizeSubscription);
        UnsubscribeIfSubscribed(this.appConfigSubscription);
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

    GetPlatformInfo() {
        this.PushAppInfo();
        UnsubscribeIfSubscribed(this.resizeSubscription);
        this.resizeSubscription = this.platform.resize.subscribe(() => this.PushAppInfo());
    }

    PushAppInfo() {
        AppInfoService.PushAppInfo({
            appWidth: this.platform.width(),
            appHeight: this.platform.height(),
            userAgent: navigator.userAgent
        });
    }
}
