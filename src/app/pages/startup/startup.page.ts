import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {AccountService} from "../../services/account.service";

@Component({
    selector: 'app-startup',
    templateUrl: './startup.page.html',
    styleUrls: ['./startup.page.scss'],
})
export class StartupPage {

    private accountSubscription?: Subscription;

    constructor(private router: Router, private accountService: AccountService) { }

    ionViewDidEnter() {
        if (this.accountSubscription && !this.accountSubscription.closed)
            this.accountSubscription.unsubscribe();
        this.accountSubscription = this.accountService.GetUserObservable().subscribe(async (answer) => {
            if(typeof answer == "boolean")//todo test this on a mobile app (loading html offline)
                return;
            if (!answer) {
                await this.router.navigate(["/login"]);
                return;
            }
            await this.router.navigate(["/home"]);
        });
    }

    ionViewWillLeave() {
        if (this.accountSubscription && !this.accountSubscription.closed)
            this.accountSubscription.unsubscribe();
        console.log()
    }
}
