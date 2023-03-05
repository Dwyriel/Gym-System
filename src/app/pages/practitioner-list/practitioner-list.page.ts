import {Component} from '@angular/core';
import {ExercisesService} from "../../services/exercises.service";
import {PractitionerService} from "../../services/practitioner.service";
import {AlertService} from "../../services/alert.service";
import {AccountService} from "../../services/account.service";
import {Practitioner} from "../../classes/practitioner";
import {waitForFirebaseResponse} from "../../services/app.utility";

@Component({
    selector: 'app-practitioner-list',
    templateUrl: './practitioner-list.page.html',
    styleUrls: ['./practitioner-list.page.scss'],
})
export class PractitionerListPage {
    private readonly minSkeletonTextSize = 100;
    private readonly skeletonTextVariation = 250;
    private readonly skeletonTextNumOfItems = 7;
    private allPractitionersAsString: string = "";

    public skeletonTextItems: string[] = [];
    public allPractitioners?: Array<Practitioner>;
    public searchFilter: string = "";
    public practitionerArrayIsEmpty = true;
    public fetchingData = true;

    constructor(private exercisesService: ExercisesService, private practitionersService: PractitionerService, private alertService: AlertService, private accountService: AccountService) { }

    async ionViewWillEnter() {
        this.setSkeletonText();
        if (await waitForFirebaseResponse(this.accountService))
            await this.PopulateInterface();
    }

    ionViewDidLeave() {
        this.allPractitioners = new Array<Practitioner>();
        this.searchFilter = "";
        this.fetchingData = true;
    }

    setSkeletonText(){
        this.skeletonTextItems = [];
        for (let i = 0; i < this.skeletonTextNumOfItems; i++)
            this.skeletonTextItems.push("width: " + ((Math.random() * this.skeletonTextVariation) + this.minSkeletonTextSize) + "px");
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
