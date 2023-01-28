import {Component} from '@angular/core';
import {ExercisesService} from "../../services/exercises.service";
import {PractitionerService} from "../../services/practitioner.service";
import {AlertService} from "../../services/alert.service";
import {AccountService} from "../../services/account.service";
import {Practitioner} from "../../classes/practitioner";
import {waitForFirebaseResponse} from "../../services/app.utility";

@Component({
    selector: 'app-practitioners',
    templateUrl: './practitioners.page.html',
    styleUrls: ['./practitioners.page.scss'],
})
export class PractitionersPage {
    public allPractitioners?: Array<Practitioner>;
    private allPractitionersAsString: string = "";

    public searchFilter: string = "";
    public practitionerArrayIsEmpty = true;
    public fetchingData = true;

    constructor(private exercisesService: ExercisesService, private practitionersService: PractitionerService, private alertService: AlertService, private accountService: AccountService) { }

    async ionViewWillEnter() {
        let id = await this.alertService.PresentLoading("Carregando");
        if (await waitForFirebaseResponse(this.accountService))
            await this.PopulateInterface();
        await this.alertService.DismissLoading(id);
    }

    ionViewDidLeave() {
        this.allPractitioners = new Array<Practitioner>();
        this.searchFilter = "";
    }

    async PopulateInterface() {
        this.fetchingData = true;
        this.allPractitioners = await this.practitionersService.GetAllPractitioners();
        this.allPractitionersAsString = JSON.stringify(this.allPractitioners);
        this.practitionerArrayIsEmpty = this.allPractitioners.length < 1;
        this.fetchingData = false;
    }

    RepopulateInterface() {
        this.allPractitioners = JSON.parse(this.allPractitionersAsString);
    }

    async SearchNames() {
        if (!this.allPractitioners)
            return;
        this.RepopulateInterface();
        for (let i = 0; i < this.allPractitioners!.length; i++) {
            let name = this.allPractitioners[i].name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
            if (!name.includes(this.searchFilter.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, ""))) {
                this.allPractitioners.splice(i, 1);
                i--;
            }
        }
    }
}
