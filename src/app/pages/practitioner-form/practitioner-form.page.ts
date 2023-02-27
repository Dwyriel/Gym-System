import {Component} from '@angular/core';
import {waitForFirebaseResponse} from "../../services/app.utility";
import {AccountService} from "../../services/account.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Practitioner} from "../../classes/practitioner";

@Component({
    selector: 'app-practitioner-form',
    templateUrl: './practitioner-form.page.html',
    styleUrls: ['./practitioner-form.page.scss'],
})
export class PractitionerFormPage {

    public practitioner: Practitioner = new Practitioner();
    public isLoading: boolean = false;
    public practitionerID?: string | null;

    constructor(private activatedRoute: ActivatedRoute, private accountService: AccountService) {}

    async ionViewWillEnter() {
        this.isLoading = true;
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
        this.isLoading = false;
    }

    ionViewDidLeave() {
        this.isLoading = false;
        this.practitionerID = null;
    }

    async EnterPressed() {
        if (this.practitioner.name)
            await this.OnClick();
    }

    async OnClick() {

    }
}
