import { Component } from '@angular/core';
import {UnsubscribeIfSubscribed} from "../../services/app.utility";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {AccountService} from "../../services/account.service";
import {MenuController} from "@ionic/angular";

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
})
export class ConfigPage {
    private userSubscription?: Subscription;

    constructor(private router: Router, private accountService: AccountService) { }

    ionViewDidEnter() {
    UnsubscribeIfSubscribed(this.userSubscription);
        this.userSubscription = this.accountService.GetUserObservable().subscribe(async answer => {
            if (typeof answer == "boolean" || answer)
                return;
            await this.router.navigate(["/login"]);
        });
    }

    ionViewWillLeave() {
        UnsubscribeIfSubscribed(this.userSubscription);
    }

    async LogoutBtn() {
        // await this.menu.close("menu");
        await this.accountService.Logout().then(async () => {
            await this.router.navigate(["/login"]);
        });
    }
}
