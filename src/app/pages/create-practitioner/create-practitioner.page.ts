import {Component} from '@angular/core';
import {waitForFirebaseResponse} from "../../services/app.utility";
import {AccountService} from "../../services/account.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Practitioner} from "../../classes/practitioner";

@Component({
    selector: 'app-create-practitioner',
    templateUrl: './create-practitioner.page.html',
    styleUrls: ['./create-practitioner.page.scss'],
})
export class CreatePractitionerPage {

    public practitioner: Practitioner = new Practitioner();
    public isLoading: boolean = false;
    public practitionerID?: string | null;

    constructor(private activatedRoute: ActivatedRoute, private accountService: AccountService) {}

    async ionViewWillEnter() {
        this.isLoading = true;
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
    }

    ionViewDidLeave() {
        this.isLoading = false;
        this.practitionerID = null;
    }

    EnterPressed(){

    }

    OnClick(){

    }
}
