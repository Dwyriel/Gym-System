import {Component, ElementRef, ViewChild} from '@angular/core';
import {AccountService} from "../../services/account.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage {
    @ViewChild('LoginDiv') LoginDiv?: ElementRef;
    @ViewChild('GymName') GymName?: ElementRef;
    @ViewChild('Message') Message?: ElementRef;

    email: string = "";
    password: string = "";
    isLoading: boolean = false;

    constructor(private accountService: AccountService) {}

    ionViewDidEnter() {
        this.LoginDiv?.nativeElement.style.setProperty("--calculatedOffsetY", ((this.LoginDiv?.nativeElement.offsetHeight / 2) * -1) + "px");
        this.LoginDiv?.nativeElement.style.setProperty("--calculatedOffsetX", ((this.LoginDiv?.nativeElement.offsetWidth / 2) * -1) + "px");
        this.GymName?.nativeElement.style.setProperty("--calculatedOffset", ((this.GymName?.nativeElement.offsetWidth / 2) * -1) + "px");
    }

    ionViewWillLeave() {
        this.email = "";
        this.password = "";
    }

    async LoginBtn() {
        this.isLoading = true;
        await this.accountService.Login(this.email, this.password)
            .then(asnwer => {
                this.isLoading = false;
                //todo redirect
            }).catch(error => {
                this.Message?.nativeElement.style.setProperty("color", "var(--ion-color-danger)");
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
        this.Message?.nativeElement.style.setProperty("color", "var(--ion-color-danger)");
        this.Message!.nativeElement.textContent = message;
    }
}
