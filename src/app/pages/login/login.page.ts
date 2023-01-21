import {Component, ElementRef, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {gymName} from '../../../environments/environment';
import {AccountService} from "../../services/account.service";
import {AppInfoService} from "../../services/app-info.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage {
    readonly gymName: string = gymName;

    private appInfoSubscription?: Subscription;

    @ViewChild('LoginDiv') LoginDivElement?: ElementRef;
    @ViewChild('GymName') GymNameElement?: ElementRef;
    @ViewChild('Message') MessageElement?: ElementRef;

    email: string = "";
    password: string = "";
    isLoading: boolean = false;

    constructor(private router: Router, private accountService: AccountService) {}

    ionViewWillEnter() {
        if (this.appInfoSubscription && !this.appInfoSubscription.closed)
            this.appInfoSubscription.unsubscribe();
        this.appInfoSubscription = AppInfoService.GetAppInfoObservable().subscribe(appInfo => {
            if (!appInfo)
                return
            this.LoginDivElement!.nativeElement.style.setProperty("--calculatedOffsetY", ((this.LoginDivElement?.nativeElement.offsetHeight / 2) * -1) + "px");
            this.LoginDivElement!.nativeElement.style.setProperty("--calculatedOffsetX", (appInfo.appWidth >= 600) ? (((this.LoginDivElement?.nativeElement.offsetWidth / 2) * -1) + "px") : "-50%");
            this.GymNameElement!.nativeElement.style.setProperty("--calculatedOffset", ((this.GymNameElement?.nativeElement.offsetWidth / 2) * -1) + "px");
        });
    }

    ionViewWillLeave() {
        this.email = "";
        this.password = "";
        if (this.appInfoSubscription && !this.appInfoSubscription.closed)
            this.appInfoSubscription.unsubscribe();
    }

    async LoginBtn() {
        this.isLoading = true;
        await this.accountService.Login(this.email, this.password)
            .then(async asnwer => {
                this.isLoading = false;
                await this.router.navigate(["/"]);
            }).catch(error => {
                this.MessageElement!.nativeElement.style.setProperty("color", "var(--ion-color-danger)");
                this.ShowLoginError(error.code);
                this.isLoading = false;
                this.password = "";
            });
    }

    ShowLoginError(errorCode: string) {
        switch (errorCode) {
            case "auth/invalid-email":
            case "auth/user-not-found":
                this.DisplayErrorMessage("Email inválido");
                break;
            case "auth/wrong-password":
                this.DisplayErrorMessage("Senha inválida");
                break;
            case "auth/network-request-failed":
                this.DisplayErrorMessage("Sem conexão");
                break;
            default:
                this.DisplayErrorMessage(errorCode);
        }
    }

    async EnterPressed() {
        if (!this.email) {
            this.DisplayErrorMessage("Campo email vazio");
            return;
        }
        if (!this.password) {
            this.DisplayErrorMessage("Campo senha vazio");
            return;
        }
        await this.LoginBtn();
    }

    DisplayErrorMessage(message: string) {
        this.MessageElement!.nativeElement.style.setProperty("color", "var(--ion-color-danger)");
        this.MessageElement!.nativeElement.textContent = message;
    }
}
