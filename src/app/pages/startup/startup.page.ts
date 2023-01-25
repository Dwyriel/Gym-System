import {Component, ElementRef, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {gymName} from '../../../environments/environment';
import {AppInfoService} from "../../services/app-info.service";
import {Router} from "@angular/router";
import {AccountService} from "../../services/account.service";
import {UnsubscribeIfSubscribed} from "../../services/app.utility";

@Component({
    selector: 'app-startup',
    templateUrl: './startup.page.html',
    styleUrls: ['./startup.page.scss'],
})
export class StartupPage {
    @ViewChild('SpinnerDiv') SpinnerDivElement?: ElementRef;

    readonly gymName: string = gymName;

    private appInfoSubscription?: Subscription;

    constructor(private router: Router, private accountService: AccountService) { }

    ionViewWillEnter() {
        this.SetOffsetsOfElements();
    }

    ionViewWillLeave() {
        UnsubscribeIfSubscribed(this.appInfoSubscription);
    }

    SetOffsetsOfElements() {
        UnsubscribeIfSubscribed(this.appInfoSubscription);
        this.appInfoSubscription = AppInfoService.GetAppInfoObservable().subscribe(appInfo => {
            if (!appInfo)
                return;
            this.SpinnerDivElement!.nativeElement.style.setProperty("--calculatedOffsetY", ((this.SpinnerDivElement?.nativeElement.offsetHeight / 2) * -1) - 40 + "px");
            this.SpinnerDivElement!.nativeElement.style.setProperty("--calculatedOffsetX", (appInfo.appWidth >= 600) ? (((this.SpinnerDivElement?.nativeElement.offsetWidth / 2) * -1) + "px") : "-50%");
        });
    }
}
