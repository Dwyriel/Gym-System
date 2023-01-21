import { Component, OnInit } from '@angular/core';
import { AccountService } from "../../services/account.service";
import { MenuController } from "@ionic/angular";
import {Router} from "@angular/router";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

    constructor(private router: Router, private accountService: AccountService, private menu: MenuController) { }

    ngOnInit() {}

    ionWillLeave() {
        this.menu.close("menu").then();
    }

    async LogoutBtn() {
        await this.accountService.Logout()
            .then(async () => {
            await this.router.navigate(["login"]);
            });
    }
}
