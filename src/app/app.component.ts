import {Component, OnDestroy, OnInit} from '@angular/core';
import {Platform} from "@ionic/angular";
import {Subscription} from "rxjs";
import {AppInfoService} from "./services/app-info.service";
import {DeviceIDService} from "./services/device-id.service";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

    private resizeSubscription?: Subscription;

    constructor(private platform: Platform, private deviceIDService: DeviceIDService) {}

    async ngOnInit() {
        await this.deviceIDService.SetDeviceName();
        this.GetPlatformInfo();
    }

    async ngOnDestroy() {
        if (this.resizeSubscription && !this.resizeSubscription.closed)
            this.resizeSubscription.unsubscribe();
    }

    GetPlatformInfo() {
        this.PushAppInfo();
        if (this.resizeSubscription && !this.resizeSubscription.closed)
            this.resizeSubscription.unsubscribe();
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
