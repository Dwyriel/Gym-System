import {Component, OnInit} from '@angular/core';
import {ExerciseTemplate} from "../../interfaces/exercise-template";
import {ExercisesService} from "../../services/exercises.service";
import {waitForFirebaseResponse} from "../../services/app.utility";
import {AccountService} from "../../services/account.service";
import {AlertService} from "../../services/alert.service";
import {PractitionerService} from "../../services/practitioner.service";

@Component({
    selector: 'app-template-list',
    templateUrl: './template-list.page.html',
    styleUrls: ['./template-list.page.scss'],
})
export class TemplateListPage {
    private readonly minSkeletonTextSize = 150;
    private readonly skeletonTextVariation = 200;
    private readonly skeletonTextNumOfItems = 8;
    private previouslyDeleted = false;


    public templatesListUnaltered: ExerciseTemplate[] = [];
    public templatesList: ExerciseTemplate[] = [];
    public templatesListArrayIsEmpty = true;
    public skeletonTextItems: string[] = [];
    public searchFilter: string = "";
    public fetchingData = true;

    constructor(private exercisesService: ExercisesService, private practitionerService: PractitionerService,private accountService: AccountService, private alertService: AlertService) { }

    async ionViewWillEnter() {
        this.setSkeletonText();
        if (await waitForFirebaseResponse(this.accountService))
            await this.PopulateInterface();
    }

    ionViewDidLeave() {
        this.templatesList = [];
        this.searchFilter = "";
        this.fetchingData = true;
    }

    private setSkeletonText() {
        this.skeletonTextItems = [];
        for (let i = 0; i < this.skeletonTextNumOfItems; i++)
            this.skeletonTextItems.push(`width: ${((Math.random() * this.skeletonTextVariation) + this.minSkeletonTextSize)}px`);
    }

    private async PopulateInterface() {
        this.fetchingData = true;
        this.templatesList = await this.exercisesService.GetAllExerciseTemplates();
        this.templatesListUnaltered = [...this.templatesList];
        this.templatesListArrayIsEmpty = this.templatesList.length < 1;
        this.fetchingData = false;
    }

    private RepopulateInterface() {
        this.templatesList = [...this.templatesListUnaltered];
    }

    public async SearchNames(repopulate: boolean = true) {
        if (repopulate)
            this.RepopulateInterface();
        for (let i = 0; i < this.templatesList.length; i++) {
            let name = this.templatesList[i].name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
            if (!name.includes(this.searchFilter.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, ""))) {
                this.templatesList.splice(i, 1);
                i--;
            }
        }
    }

    public async DeleteTemplateBtn(templateToDelete: ExerciseTemplate) {
        let answer = await this.alertService.ConfirmationAlert("Apagar este ciclo?", `"${templateToDelete.name}" desaparecerá para sempre`, "Não", "Sim");
        if (!answer)
            return;
        let id = await this.alertService.PresentLoading("Carregando");
        if (await this.DeleteTemplate(templateToDelete)) {
            await this.alertService.ShowToast("Ciclo apagado com sucesso", undefined, "primary");
            this.templatesList = [...this.templatesListUnaltered];
            for (let [index, template] of this.templatesList.entries())
                if (template.thisObjectID == templateToDelete.thisObjectID)
                    this.templatesList.splice(index, 1);
            this.templatesListUnaltered = [...this.templatesList];
            await this.SearchNames(false);
        } else
            await this.alertService.ShowToast("O Ciclo não pode ser apagado", undefined, "danger");
        await this.alertService.DismissLoading(id);

    }

    private async DeleteTemplate(templateToDelete: ExerciseTemplate): Promise<boolean> {
        if (!templateToDelete.thisObjectID)
            return false;
        let errorOccurred = await this.removeFromPractitioners(templateToDelete.name);
        await this.exercisesService.DeleteExerciseTemplate(templateToDelete.thisObjectID).catch(() => errorOccurred = true);
        this.previouslyDeleted = !errorOccurred;
        return !errorOccurred;
    }

    private async removeFromPractitioners(templateName: string): Promise<boolean> {
        let errorOccurred = false;
        let allPractitioners = this.previouslyDeleted ? await this.practitionerService.GetAllPractitionersFromCache() : await this.practitionerService.GetAllPractitioners();
        for (let i = 0; i < allPractitioners.length; i++) {
            if (allPractitioners[i].templateName == templateName)
                await this.practitionerService.UpdatePractitioner(allPractitioners[i].thisObjectID!, {templateName: ""}).catch(() => errorOccurred = true);
            if (errorOccurred)
                return errorOccurred;
        }
        return errorOccurred;
    }
}
