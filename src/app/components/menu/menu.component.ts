import {Component, OnInit} from '@angular/core';
import {AccountService} from "../../services/account.service";
import {MenuController} from "@ionic/angular";
import {DeviceIDService} from "../../services/device-id.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
    displayUsername: string | null | undefined;
    deviceName: string | null = null;

    constructor(private router: Router, private accountService: AccountService, private menu: MenuController, private deviceIDService: DeviceIDService) { }

    ngOnInit() {
        this.deviceIDService.GetDeviceNameObservable().subscribe(deviceName => this.deviceName = deviceName);
        this.accountService.GetUserObservable().subscribe(result => {
            if (result && typeof result != "boolean") {
                this.displayUsername = (result?.displayName) ? result?.displayName : result?.email;
            }
        });
    }

    ionViewWillEnter() {
        console.log("Hewwo");
    }

    async LogoutBtn() {
        await this.menu.close("menu");
        await this.accountService.Logout().then(async () => {
            await this.router.navigate(["/login"]);
        });
    }
}
