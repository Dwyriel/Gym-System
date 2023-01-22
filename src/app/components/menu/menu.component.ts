import {Component, OnDestroy, OnInit} from '@angular/core';
import {AccountService} from "../../services/account.service";
import {MenuController} from "@ionic/angular";
import {DeviceIDService} from "../../services/device-id.service";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {UnsubscribeIfSubscribed} from "../../services/app.utility";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
    displayUsername: string | null | undefined;
    deviceName: string | null = null;

    private userSubscription?: Subscription;
    private deviceIDSubscription?: Subscription;


    constructor(private router: Router, private accountService: AccountService, private menu: MenuController, private deviceIDService: DeviceIDService) { }

    ngOnInit() {
        UnsubscribeIfSubscribed(this.deviceIDSubscription);
        this.deviceIDSubscription = this.deviceIDService.GetDeviceNameObservable().subscribe(deviceName => this.deviceName = deviceName);
        UnsubscribeIfSubscribed(this.userSubscription);
        this.userSubscription = this.accountService.GetUserObservable().subscribe(result => {
            if (result && typeof result != "boolean") {
                this.displayUsername = (result?.displayName) ? result?.displayName : result?.email;
            }
        });
    }

    ngOnDestroy() {
        UnsubscribeIfSubscribed(this.deviceIDSubscription);
        UnsubscribeIfSubscribed(this.userSubscription);
    }

    async LogoutBtn() {
        await this.menu.close("menu");
        await this.accountService.Logout().then(async () => {
            await this.router.navigate(["/login"]);
        });
    }
}
