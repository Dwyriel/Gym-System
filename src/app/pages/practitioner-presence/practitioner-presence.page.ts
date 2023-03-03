import {Component} from '@angular/core';
import {waitForFirebaseResponse} from "../../services/app.utility";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService} from "../../services/account.service";
import {PractitionerService} from "../../services/practitioner.service";
import {Practitioner} from "../../classes/practitioner";
import {Presence} from "../../interfaces/frequency-log";

@Component({
    selector: 'app-practitioner-presence',
    templateUrl: './practitioner-presence.page.html',
    styleUrls: ['./practitioner-presence.page.scss'],
})
export class PractitionerPresencePage {

    private practitioner: Practitioner = new Practitioner();
    private practitionerID: string | null = null;

    public presenceLog: Presence[] = [];

    constructor(private router: Router, private activatedRoute: ActivatedRoute, private accountService: AccountService, private practitionerService: PractitionerService) { }

    async ionViewWillEnter() {
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");
        if (!(await this.getPractitioner()))
            return;
        await this.practitionerService.GetPractitionersPresences(this.practitioner.presenceLogID, true).then(returnedValue => this.presenceLog = returnedValue);//todo catch
        console.log(this.presenceLog);
    }

    async getPractitioner() {
        let cacheError = false, errorOccurred = false;
        await this.practitionerService.GetPractitionerFromCache(this.practitionerID!).then(result => this.practitioner = result).catch(async () => cacheError = true);
        if (cacheError)
            await this.practitionerService.GetPractitioner(this.practitionerID!).then(result => this.practitioner = result).catch(() => errorOccurred = true);
        return !errorOccurred;
    }
}
