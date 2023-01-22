import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {AccountService} from "../../services/account.service";
import {UnsubscribeIfSubscribed} from "../../services/app.utility";

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
})
export class HomePage {

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
}
