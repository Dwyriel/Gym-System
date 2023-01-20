import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { fromEvent, Observable, Subscription } from "rxjs";

import { AccountService } from "../../services/account.service";
import {user} from "@angular/fire/auth";

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage {

    @ViewChild('LoginDiv') LoginDiv?: ElementRef;
    @ViewChild('SubmitButton') SubmitButton?: ElementRef;
    @ViewChild('Message') Message?: ElementRef;


    private loginDivHeightObservable?: Observable<Event>;
    private loginDivHeightSubscription?: Subscription;

    username: string = "";
    password: string = "";

    inputIsEmpty: boolean = true;

    constructor(private accountService: AccountService) { }

    ionViewDidEnter() {
        this.LoginDiv?.nativeElement.style.setProperty("--calculatedOffset", ((this.LoginDiv?.nativeElement.offsetHeight / 2) * -1) + "px");
    }

    LoginBtn() {
        this.accountService.Login(this.username, this.password)
            .then()
            .catch(error => {
                this.Message?.nativeElement.style.setProperty("color", "var(--ion-color-danger)");
                this.DisplayErrorMessage(error.code);
        });

        this.username = "";
        this.password = "";
    }

    DisplayErrorMessage(errorCode: string) {
        switch (errorCode) {
            case "auth/invalid-email":
            case "auth/user-not-found":
                this.Message!.nativeElement.textContent = "Email inválido";
                break;
            case "auth/wrong-password":
                this.Message!.nativeElement.textContent = "Senha inválida";
                break;
            case "auth/network-request-failed":
                this.Message!.nativeElement.textContent = "Sem conexão";
                break;
            default:
                this.Message!.nativeElement.textContent = errorCode;
        }
    }

    ChangeOnInput() {
        setTimeout(() => {this.inputIsEmpty = !(this.username != "" && this.password != "")}, 10);
    }
}
