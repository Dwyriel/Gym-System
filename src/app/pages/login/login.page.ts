import {Component, ElementRef, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {gymName} from '../../../environments/environment';
import {AccountService} from "../../services/account.service";
import {AppInfoService} from "../../services/app-info.service";
import {UnsubscribeIfSubscribed, waitForFirebaseResponse} from "../../services/app.utility";

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage {
    readonly gymName: string = gymName;
    messageContent: string = "Usuário: teste123@test.com; Senha: teste123.";

    private appInfoSubscription?: Subscription;

    @ViewChild('LoginDiv') LoginDivElement?: ElementRef;
    @ViewChild('GymName') GymNameElement?: ElementRef;
    @ViewChild('Message') MessageElement?: ElementRef;

    email: string = "";
    password: string = "";
    isLoading: boolean = false;

    constructor(private accountService: AccountService) {}

    async ionViewWillEnter() {
        UnsubscribeIfSubscribed(this.appInfoSubscription);
        this.appInfoSubscription = AppInfoService.GetAppInfoObservable().subscribe(appInfo => {
            if (!appInfo)
                return;
            this.LoginDivElement!.nativeElement.style.setProperty("--calculatedOffsetY", ((this.LoginDivElement?.nativeElement.offsetHeight / 2) * -1) + "px");
            this.LoginDivElement!.nativeElement.style.setProperty("--calculatedOffsetX", (appInfo.appWidth >= 600) ? (((this.LoginDivElement?.nativeElement.offsetWidth / 2) * -1) + "px") : "-50%");
            this.GymNameElement!.nativeElement.style.setProperty("--calculatedOffset", ((this.GymNameElement?.nativeElement.offsetWidth / 2) * -1) + "px");
        });
    }

    ionViewWillLeave() {
        this.messageContent = "Entre em contato com o administrador do sistema para obter acesso.";
        this.MessageElement!.nativeElement.style.setProperty("color", "var(--ion-text-color)");
        this.email = "";
        this.password = "";
        UnsubscribeIfSubscribed(this.appInfoSubscription);
    }

    async LoginBtn() {
        this.isLoading = true;
        await this.accountService.Login(this.email, this.password)
            .then(async answer => {
                this.isLoading = false;
            }).catch(error => {
                this.MessageElement!.nativeElement.style.setProperty("color", "var(--ion-color-danger)");
                this.ShowLoginError(error.code);
                this.isLoading = false;
                this.password = "";
            });
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
            case "auth/user-disabled":
                this.DisplayErrorMessage("Conta desabilitada");
                break;
            default:
                this.DisplayErrorMessage(errorCode);
        }
    }

    DisplayErrorMessage(message: string) {
        this.MessageElement!.nativeElement.style.setProperty("color", "var(--ion-color-danger)");
        this.messageContent = message;
    }
}
