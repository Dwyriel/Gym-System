import {Component} from '@angular/core';
import {waitForFirebaseResponse} from "../../services/app.utility";
import {AccountService} from "../../services/account.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-create-practitioner',
    templateUrl: './create-practitioner.page.html',
    styleUrls: ['./create-practitioner.page.scss'],
})
export class CreatePractitionerPage {

    public practitionerID?: string | null;

    constructor(private activatedRoute: ActivatedRoute, private accountService: AccountService) {}

    async ionViewWillEnter() {
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
    }

    ionViewDidLeave() {
        this.practitionerID = null;
    }

}
