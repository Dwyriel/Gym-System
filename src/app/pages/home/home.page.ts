import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {AccountService} from "../../services/account.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
})
export class HomePage {

    private authSubscription?: Subscription;

    constructor(private router: Router, private accountService: AccountService) { }

    ionViewDidEnter() {
        if (this.authSubscription && !this.authSubscription.closed)
            this.authSubscription.unsubscribe();
        this.authSubscription = this.accountService.GetUserObservable().subscribe(async answer => {
            if (typeof answer == "boolean" || answer)
                return;
            await this.router.navigate(["/login"]);
        });
    }

    ionViewWillLeave(){
        if (this.authSubscription && !this.authSubscription.closed)
            this.authSubscription.unsubscribe();
    }

}
