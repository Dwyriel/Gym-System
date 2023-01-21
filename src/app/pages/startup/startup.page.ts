import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {gymName} from '../../../environments/environment';
import {AppInfoService} from "../../services/app-info.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-startup',
    templateUrl: './startup.page.html',
    styleUrls: ['./startup.page.scss'],
})
export class StartupPage implements OnInit {
    @ViewChild('SpinnerDiv') SpinnerDivElement?: ElementRef;

    readonly gymName: string = gymName;

    private appInfoSubscription?: Subscription;

    constructor() { }

    ionViewDidEnter() {
        if (this.appInfoSubscription && !this.appInfoSubscription.closed)
            this.appInfoSubscription.unsubscribe();
        this.appInfoSubscription = AppInfoService.GetAppInfoObservable().subscribe(appInfo => {
            if (!appInfo)
                return
            this.SpinnerDivElement!.nativeElement.style.setProperty("--calculatedOffsetY", ((this.SpinnerDivElement?.nativeElement.offsetHeight / 2) * -1) - 40 + "px");
            this.SpinnerDivElement!.nativeElement.style.setProperty("--calculatedOffsetX", (appInfo.appWidth >= 600) ? (((this.SpinnerDivElement?.nativeElement.offsetWidth / 2) * -1) + "px") : "-50%");
        });
    }

    ionViewWillLeave() {
        if (this.appInfoSubscription && !this.appInfoSubscription.closed)
            this.appInfoSubscription.unsubscribe();
    }

    ngOnInit() {
    }

}
