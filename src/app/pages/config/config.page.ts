import {Component} from '@angular/core';
import {UnsubscribeIfSubscribed} from "../../services/app.utility";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {AccountService} from "../../services/account.service";
import {AppInfoService} from "../../services/app-info.service";
import {Themes} from "../../classes/app-config";
import {AlertController} from "@ionic/angular";

@Component({
    selector: 'app-config',
    templateUrl: './config.page.html',
    styleUrls: ['./config.page.scss'],
})
export class ConfigPage {
    private userSubscription?: Subscription;

    colorTheme?: string;
    accountName: string | null | undefined;

    newAccountName?: string;

    constructor(private router: Router, private accountService: AccountService, private alertController: AlertController) { }

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
        const alert = await this.alertController.create({
            header: 'Deseja sair da conta?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                },
                {
                    text: 'Sim',
                    role: 'confirm',
                    handler: async () => {
                        await this.accountService.Logout().then(async () => {
                            await this.router.navigate(["/login"]);
                        })
                    },
                },
            ],
        });
        await alert.present();
    }

    async ChangeAccountName() {
        await this.accountService.UpdateUserProfile({displayName: this.newAccountName});
        this.newAccountName = "";
    }
}