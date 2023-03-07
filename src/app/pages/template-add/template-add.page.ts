import {Component} from '@angular/core';
import {waitForFirebaseResponse} from "../../services/app.utility";
import {AccountService} from "../../services/account.service";
import {ActivatedRoute, Router} from "@angular/router";
import {PractitionerService} from "../../services/practitioner.service";
import {AlertService} from "../../services/alert.service";
import {Practitioner} from "../../classes/practitioner";
import {ExerciseTemplate} from "../../interfaces/exercise-template";
import {ExercisesService} from "../../services/exercises.service";
import {Exercise, PractitionerExercise} from "../../interfaces/exercise";
import {SelectExerciseAndWorkloadComponent} from "../../components/select-exercise-and-workload/select-exercise-and-workload.component";
import {PopoverController} from "@ionic/angular";

interface internalTemplateExercise {
    checked: boolean;
    exercise: Exercise;
    workload: { series?: number, repetition?: number, rest?: number, load?: number };
}

function sortByName(first: ExerciseTemplate, second: ExerciseTemplate) {
    let firstLowerCase = first.name.toLowerCase();
    let secondLowerCase = second.name.toLowerCase();
    return (firstLowerCase < secondLowerCase) ? -1 : (firstLowerCase > secondLowerCase) ? 1 : 0;
}

function sortByCategory(first: { category: string }, second: { category: string }) {
    let firstLowerCase = first.category.toLowerCase();
    let secondLowerCase = second.category.toLowerCase();
    return (firstLowerCase < secondLowerCase) ? -1 : (firstLowerCase > secondLowerCase) ? 1 : 0;
}

@Component({
    selector: 'app-template-add',
    templateUrl: './template-add.page.html',
    styleUrls: ['./template-add.page.scss'],
})
export class TemplateAddPage {
    public practitionerID: string | null = null;
    public practitioner?: Practitioner;
    public templatesList: ExerciseTemplate[] = [];
    public selectedTemplateName?: string;
    public templateExercisesByCategory: { category: string, templateExercises: internalTemplateExercise[] }[] = [];
    public isLoading = true;

    constructor(private accountService: AccountService, private activatedRoute: ActivatedRoute, private practitionerService: PractitionerService, private exercisesService: ExercisesService, private alertService: AlertService, private router: Router, private popoverController: PopoverController) { }

    async ionViewWillEnter() {
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");
        let errorOccurred = await this.getPractitioner();
        if (!errorOccurred)
            errorOccurred = await this.getTemplates();
        if (errorOccurred) {
            await this.alertService.ShowToast("Ocorreu um erro carregando as informações", undefined, "danger");
            return;
        }
        this.isLoading = false;
    }

    ionViewDidLeave() {
        this.practitioner = undefined;
        this.templatesList = [];
        this.selectedTemplateName = undefined;
        this.templateExercisesByCategory = [];
        this.isLoading = true;
    }

    async getPractitioner() {
        let cacheError = false, errorOccurred = false;
        await this.practitionerService.GetPractitionerFromCache(this.practitionerID!).then(result => this.practitioner = result).catch(() => cacheError = true);
        if (cacheError)
            await this.practitionerService.GetPractitioner(this.practitionerID!).then(result => this.practitioner = result).catch(() => errorOccurred = true);
        return errorOccurred;
    }

    async getTemplates() {
        let errorOccurred = false;
        this.templatesList = await this.exercisesService.GetAllExerciseTemplates();
        this.templatesList.sort(sortByName);
        for (let template of this.templatesList) {
            await this.exercisesService.GetTemplatesExercises(template.exerciseIDs).then(value => template.exercises = value).catch(() => errorOccurred = true);
            if (errorOccurred)
                break;
        }
        return errorOccurred;
    }

    get checkIfSomethingIsntValid() {
        return !this.selectedTemplateName || !this.templateExercisesByCategory.some(value => value.templateExercises.some(value1 => value1.checked));
    }

    changedTemplate() {
        this.templateExercisesByCategory = [];
        for (let template of this.templatesList)
            if (template.name === this.selectedTemplateName) {
                for (let exercise of template.exercises!) {
                    let indexOf = -1;
                    for (let i = 0; i < this.templateExercisesByCategory.length; i++)
                        if (this.templateExercisesByCategory[i].category === exercise.category) {
                            indexOf = i;
                            break;
                        }
                    if (indexOf === -1)
                        indexOf = this.templateExercisesByCategory.push({category: exercise.category, templateExercises: []}) - 1;
                    this.templateExercisesByCategory[indexOf].templateExercises.push({checked: false, exercise: exercise, workload: {series: undefined, repetition: undefined, rest: undefined, load: undefined}});
                }
                this.templateExercisesByCategory.sort(sortByCategory);
                return;
            }
    }

    async OnCheck(indexCat: number, indexExerc: number) {
        if (!this.templateExercisesByCategory[indexCat].templateExercises[indexExerc].checked)
            return;
        const editExercisePopover = await this.popoverController.create({
            component: SelectExerciseAndWorkloadComponent,
            mode: 'md',
            componentProps: {workloadInput: {...this.templateExercisesByCategory[indexCat].templateExercises[indexExerc].workload}},
            animated: true
        });
        editExercisePopover.onDidDismiss().then(async value => {
            if (!value.data || value.data && (!value.data.updatedWorkload.series || !value.data.updatedWorkload.repetition || !value.data.updatedWorkload.rest || !value.data.updatedWorkload.load)) {
                this.templateExercisesByCategory[indexCat].templateExercises[indexExerc].checked = !this.templateExercisesByCategory[indexCat].templateExercises[indexExerc].checked;
                return;
            }
            let workload: { series?: number, repetition?: number, rest?: number, load?: number } = value.data.updatedWorkload;
            this.templateExercisesByCategory[indexCat].templateExercises[indexExerc].workload.series = workload.series;
            this.templateExercisesByCategory[indexCat].templateExercises[indexExerc].workload.repetition = workload.repetition;
            this.templateExercisesByCategory[indexCat].templateExercises[indexExerc].workload.rest = workload.rest;
            this.templateExercisesByCategory[indexCat].templateExercises[indexExerc].workload.load = workload.load;
        });
        await editExercisePopover.present();
    }

    async OnClick() {
        let loadingID = await this.alertService.PresentLoading("Carregando");
        let exercisesToAdd: PractitionerExercise[] = [];
        for (let categoryObj of this.templateExercisesByCategory)
            for (let exercise of categoryObj.templateExercises) {
                if (!exercise.checked)
                    continue;
                exercisesToAdd.push({exerciseID: exercise.exercise.thisObjectID!, series: exercise.workload.series!, repetition: exercise.workload.repetition!, rest: exercise.workload.rest!, load: exercise.workload.load!});
            }
        let errorOccurred = false;
        await this.practitionerService.ClearExercises(this.practitioner!.exercisesID).catch(() => errorOccurred = true);
        if (!errorOccurred)
            await this.practitionerService.AddExercise(this.practitioner!.exercisesID, ...exercisesToAdd).catch(() => errorOccurred = true);
        if (!errorOccurred)
            await this.practitionerService.UpdatePractitioner(this.practitionerID!, {templateName: this.selectedTemplateName}).catch(() => errorOccurred = true);
        await this.alertService.DismissLoading(loadingID);
        if (errorOccurred) {
            await this.alertService.ShowToast("Ocorreu um erro atribuindo o ciclo", undefined, "danger");
            return;
        }
        await this.alertService.ShowToast("Ciclo atribuido com sucesso", undefined, "primary");
    }
}
