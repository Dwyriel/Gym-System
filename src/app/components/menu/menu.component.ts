import {Component, OnInit} from '@angular/core';
import { AccountService } from "../../services/account.service";
import { MenuController } from "@ionic/angular";
import {Router} from "@angular/router";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
    displayUsername: string | null | undefined;

    constructor(private router: Router, private accountService: AccountService, private menu: MenuController) { }

    ngOnInit() {
        this.accountService.GetUserObservable().subscribe(result => {
            if (result && typeof result != "boolean") {
                this.displayUsername = (result?.displayName) ? result?.displayName : result?.email;
            }
        });
    }

    async LogoutBtn() {
        await this.menu.close("menu");
        await this.accountService.Logout()
            .then(async () => {
            await this.router.navigate(["login"]);
            });
    }
}
