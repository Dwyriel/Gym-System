import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Practitioner} from "../../classes/practitioner";
import {PractitionerService} from "../../services/practitioner.service";
import {AlertService} from "../../services/alert.service";

@Component({
    selector: 'app-practitioner-profile',
    templateUrl: './practitioner-profile.page.html',
    styleUrls: ['./practitioner-profile.page.scss'],
})
export class PractitionerProfilePage {
    private practitionerID?: string | null;

    public practitionerInfo?: Practitioner;
    public isLoading: boolean = false;

    constructor(private activatedRoute: ActivatedRoute, private practitionerService: PractitionerService, private alertService: AlertService, private router: Router) { }

    async ionViewWillEnter() {
        this.isLoading = true;
        let id = await this.alertService.PresentLoading("Carregando");
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");
        this.practitionerService.GetPractitioner(this.practitionerID!)
            .then(result => { this.practitionerInfo = result; this.isLoading = false; })
            .catch(async () => await this.router.navigate(['practitioner-list']));
        await this.alertService.DismissLoading(id);
    }

    ionViewDidLeave() {
        this.isLoading = false;
        this.practitionerID = null;
        this.practitionerInfo = undefined;
    }
}
