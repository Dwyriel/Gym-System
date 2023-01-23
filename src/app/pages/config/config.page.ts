import {Component} from '@angular/core';
import {UnsubscribeIfSubscribed} from "../../services/app.utility";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {AccountService} from "../../services/account.service";
import {AppInfoService} from "../../services/app-info.service";
import {Themes} from "../../classes/app-config";
import {AlertService} from "../../services/alert.service";

@Component({
    selector: 'app-config',
    templateUrl: './config.page.html',
    styleUrls: ['./config.page.scss'],
})
export class ConfigPage {
    private userSubscription?: Subscription;

    colorTheme?: string;
    accountName: string | null | undefined;

    constructor(private router: Router, private accountService: AccountService, private alertService: AlertService) { }

    ionViewDidEnter() {
        UnsubscribeIfSubscribed(this.userSubscription);
        this.userSubscription = this.accountService.GetUserObservable().subscribe(async answer => {
            if (typeof answer == "boolean" || answer)
                return;
            await this.router.navigate(["/login"]);
        });
        this.ReadColorTheme()
    }

    ionViewWillLeave() {
        UnsubscribeIfSubscribed(this.userSubscription);
    }

    async ChangeColorTheme() {
        switch (this.colorTheme) {
            case "MatchSystem":
                await AppInfoService.PushAppConfig({theme: Themes.MatchSystem});
                break;
            case "Dark":
                await AppInfoService.PushAppConfig({theme: Themes.Dark});
                break;
            case "Light":
                await AppInfoService.PushAppConfig({theme: Themes.Light});
                break;
        }
    }

    ReadColorTheme() {
        switch (AppInfoService.GetAppConfig().theme) {
            case Themes.MatchSystem:
                this.colorTheme = "MatchSystem";
                break;
            case Themes.Dark:
                this.colorTheme = "Dark";
                break;
            case Themes.Light:
                this.colorTheme = "Light";
                break;
        }
    }

    async LogoutBtn() {
        if (await this.alertService.ConfirmationAlert('Deseja sair da conta?', "", "Cancelar", "Sim"))
            await this.accountService.Logout().then(async () => await this.router.navigate(["/login"]));
    }

    async ChangeAccountName() {
        let newName = await this.alertService.TextInputAlert("Insira o novo nome", "Novo nome", "Alterar");
        if (newName) {
            let loadingId = await this.alertService.PresentLoading("Aguarde");
            let wasSuccessful = await this.accountService.UpdateUserProfile({displayName: newName});
            await this.alertService.DismissLoading(loadingId);
            if(!wasSuccessful) {
                await this.alertService.PresentAlert("Ocorreu um erro, tente mais tarde.");
                return;
            }
            await this.alertService.ShowToast("Nome alterado com successo.", undefined, "primary");
        }
    }
}
