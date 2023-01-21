import {Component, OnDestroy, OnInit} from '@angular/core';
import {Platform} from "@ionic/angular";
import {AppInfoService} from "./services/app-info.service";
import {AppInfo} from "./interfaces/app-info";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

    private resizeSubscription?: Subscription;

    constructor(private platform: Platform) {}

    async ngOnInit() {
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
