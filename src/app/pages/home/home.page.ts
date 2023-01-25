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

    constructor(private router: Router, private accountService: AccountService) { }
    
}
