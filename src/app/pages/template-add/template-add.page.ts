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

function sortByCategory(first: internalTemplateExercise, second: internalTemplateExercise) {
    let firstLowerCase = first.exercise.category.toLowerCase();
    let secondLowerCase = second.exercise.category.toLowerCase();
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
    public templateExercises: internalTemplateExercise[] = [];
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
        this.templateExercises = [];
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
        return !this.selectedTemplateName || !this.templateExercises.some(value => value.checked);
    }

    changedTemplate() {
        this.templateExercises = [];
        for (let template of this.templatesList)
            if (template.name === this.selectedTemplateName) {
                for (let exercise of template.exercises!)
                    this.templateExercises.push({checked: false, exercise: exercise, workload: {series: undefined, repetition: undefined, rest: undefined, load: undefined}});
                this.templateExercises.sort(sortByCategory);
                return;
            }
    }

    async OnCheck(event: any, index: number) {
        if (!this.templateExercises[index].checked)
            return;
        const editExercisePopover = await this.popoverController.create({
            component: SelectExerciseAndWorkloadComponent,
            mode: 'md',
            componentProps: {workloadInput: {...this.templateExercises[index].workload}},
            animated: true
        });
        editExercisePopover.onDidDismiss().then(async value => {
            if (!value.data || value.data && (!value.data.updatedWorkload.series || !value.data.updatedWorkload.repetition || !value.data.updatedWorkload.rest || !value.data.updatedWorkload.load)) {
                this.templateExercises[index].checked = !this.templateExercises[index].checked;
                return;
            }
            let workload: { series?: number, repetition?: number, rest?: number, load?: number } = value.data.updatedWorkload;
            this.templateExercises[index].workload.series = workload.series;
            this.templateExercises[index].workload.repetition = workload.repetition;
            this.templateExercises[index].workload.rest = workload.rest;
            this.templateExercises[index].workload.load = workload.load;
        });
        await editExercisePopover.present();
    }

    async OnClick() {
        let loadingID = await this.alertService.PresentLoading("Carregando");
        let exercisesToAdd: PractitionerExercise[] = [];
        for (let exercise of this.templateExercises) {
            if (!exercise.checked)
                continue;
            exercisesToAdd.push({exerciseID: exercise.exercise.thisObjectID!, series: exercise.workload.series!, repetition: exercise.workload.repetition!, rest: exercise.workload.rest!, load: exercise.workload.load!});
        }
        let errorOccurred = false;
        await this.practitionerService.ClearExercises(this.practitioner!.exercisesID).catch(() => errorOccurred = true);
        if (!errorOccurred)
            await this.practitionerService.AddExercise(this.practitioner!.exercisesID, ...exercisesToAdd).catch(() => errorOccurred = true);
        if (!errorOccurred)
            await this.practitionerService.UpdatePractitioner(this.practitionerID!, {templateName: this.selectedTemplateName}).catch((err) => {
                errorOccurred = true
                console.log(err);
            });
        await this.alertService.DismissLoading(loadingID);
        if (errorOccurred) {
            await this.alertService.ShowToast("Ocorreu um erro atribuindo o ciclo", undefined, "danger");
            return;
        }
        await this.alertService.ShowToast("Ciclo atribuido com sucesso", undefined, "primary");
    }
}
