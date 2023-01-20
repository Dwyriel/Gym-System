import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { fromEvent, Observable, Subscription } from "rxjs";

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage {

    @ViewChild('LoginDiv') LoginDiv?: ElementRef;

    private loginDivHeightObservable?: Observable<Event>;
    private loginDivHeightSubscription?: Subscription;

    username: String = "";
    password: String = "";

    constructor() { }

    ionViewDidEnter() {
        this.LoginDiv?.nativeElement.style.setProperty("--calculatedOffset", ((this.LoginDiv?.nativeElement.offsetHeight / 2) * -1) + "px");
    }

    submitCredentials() {

    }
}
