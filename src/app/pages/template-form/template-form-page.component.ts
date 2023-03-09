import {Component} from '@angular/core';
import {PopoverController} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {SelectExerciseAndWorkloadComponent} from "../../components/select-exercise-and-workload/select-exercise-and-workload.component";
import {AccountService} from "../../services/account.service";
import {ExercisesService} from "../../services/exercises.service";
import {AlertService} from "../../services/alert.service";
import {Exercise, PractitionerExercise} from "../../interfaces/exercise";
import {ExerciseTemplate} from "../../interfaces/exercise-template";
import {AppInfoService} from "../../services/app-info.service";
import {PractitionerService} from "../../services/practitioner.service";

function sortByCategory(firstExerc: Exercise, secondExerc: Exercise) {
    let firstLowerCase = firstExerc.category.toLowerCase();
    let secondLowerCase = secondExerc.category.toLowerCase();
    return (firstLowerCase < secondLowerCase) ? -1 : (firstLowerCase > secondLowerCase) ? 1 : 0;
}

function sortByName(firstExerc: Exercise, secondExerc: Exercise) {
    let firstLowerCase = firstExerc.name.toLowerCase();
    let secondLowerCase = secondExerc.name.toLowerCase();
    return (firstLowerCase < secondLowerCase) ? -1 : (firstLowerCase > secondLowerCase) ? 1 : 0;
}

@Component({
    selector: 'app-template-form',
    templateUrl: './template-form-page.component.html',
    styleUrls: ['./template-form-page.component.scss'],
})
export class TemplateFormPage {
    private allExercises: Exercise[] = [];
    private allExerciseTemplates: ExerciseTemplate[] = [];
    private addedExercises: Exercise[] = [];
    private originalName?: string;
    private changed = false;

    public exerciseTemplateID: string | null = null;
    public templateName?: string;
    public exercisesByCategory: { name: string, exercises: Exercise[] }[] = [];
    public isLoading = true;

    constructor(private router: Router, private activatedRoute: ActivatedRoute, private accountService: AccountService, private exercisesService: ExercisesService, private practitionerService: PractitionerService, private popoverController: PopoverController, private alertService: AlertService) { }

    async ionViewWillEnter() {
        this.exerciseTemplateID = this.activatedRoute.snapshot.paramMap.get("id");
        await this.getAllInfos();
        this.isLoading = false;
    }

    ionViewDidLeave() {
        this.exerciseTemplateID = null;
        this.isLoading = true;
    }

    async getAllInfos() {
        let errorOccurred = false;
        if (this.exerciseTemplateID)
            await this.exercisesService.GetExerciseTemplate(this.exerciseTemplateID).then(async value => {
                this.originalName = value.name;
                this.templateName = value.name;
                this.exercisesService.GetTemplatesExercises(value.exerciseIDs).then(value1 => {
                    this.addedExercises = value1;
                    this.filterExercisesByCategory();
                }).catch(() => errorOccurred = true);
            }).catch(() => errorOccurred = true);
        if (errorOccurred) {
            await this.alertService.ShowToast("Ocorreu um erro carregando as informações", undefined, "danger");
            return;
        }
        await this.getExercisesAndTemplates();
    }

    async getExercisesAndTemplates() {
        let errorOccurred = false;
        await this.exercisesService.GetAllExercises().then(value => this.allExercises = value).catch(async () => {
            await this.alertService.ShowToast("Ocorreu um erro carregando as informações", undefined, "danger");
            errorOccurred = true;
        });
        if (!errorOccurred)
            await this.getExerciseTemplates();
    }

    async getExerciseTemplates() {
        let cacheError = false;
        await this.exercisesService.GetAllExerciseTemplatesFromCache().then(value => this.allExerciseTemplates = value).catch(() => cacheError = true);
        if (cacheError)
            await this.exercisesService.GetAllExerciseTemplates().then(value => this.allExerciseTemplates = value)
                .catch(() => this.alertService.ShowToast("Ocorreu um erro carregando as informações", undefined, "danger"));
    }

    get filteredExercisesArray() {
        let exercisesNotYetAdded: Exercise[] = [];
        for (let exercise of this.allExercises) {
            if (!this.addedExercises.some(value => value.category === exercise.category && value.name === exercise.name))
                exercisesNotYetAdded.push(exercise);
        }
        return exercisesNotYetAdded.sort(sortByCategory);
    }

    filterExercisesByCategory() {
        this.exercisesByCategory = [];
        this.addedExercises.sort(sortByCategory);
        for (let exercise of this.addedExercises) {
            if (!this.exercisesByCategory.some(value => value.name === exercise.category)) {
                this.exercisesByCategory.push({name: exercise.category, exercises: [exercise]});
                continue;
            }
            for (let index = 0; index < this.exercisesByCategory.length; index++) {
                if (this.exercisesByCategory[index].name === exercise.category) {
                    this.exercisesByCategory[index].exercises.push(exercise);
                    this.exercisesByCategory[index].exercises.sort(sortByName);
                    break;
                }
            }
        }
    }

    get checkIfSendConditionsAreMet() {
        return this.templateName && this.addedExercises.length > 0;
    }

    onRemoveExerciseButtonClick(exercise: Exercise) {
        this.changed = true;
        this.addedExercises.splice(this.addedExercises.findIndex(value => value.category == exercise.category && value.name == exercise.name), 1);
        this.filterExercisesByCategory();
    }

    async onAddExerciseButtonClick() {
        this.changed = true;
        const addExercisePopover = await this.popoverController.create({
            component: SelectExerciseAndWorkloadComponent,
            mode: 'md',
            componentProps: {exercisesInput: this.filteredExercisesArray, onlyExercise: true},
            animated: true
        });
        addExercisePopover.onDidDismiss().then(async value => {
            if (value.data) {
                this.addedExercises.push(value.data.selectedExercise.exercise);
                this.filterExercisesByCategory();
            }
        });
        await addExercisePopover.present();
    }

    async EnterPressed() {
        if (this.checkIfSendConditionsAreMet)
            await this.onCreateOrUpdateButtonClick();
    }

    async onCreateOrUpdateButtonClick() {
        if (!AppInfoService.AppInfo?.isOnline) {
            await this.alertService.ShowToast("Dispositivo não está conectado a internet", undefined, "danger");
            return;
        }
        this.isLoading = true;
        let functionResult: Promise<any> = this.CreateOrUpdateExerciseTemplate(Boolean(this.exerciseTemplateID));
        await functionResult.then(async () => {
            await this.alertService.ShowToast((this.exerciseTemplateID) ? "Ciclo alterado com sucesso" : "Ciclo criado com sucesso", undefined, "primary");
            await this.router.navigate(["/template-list"]);
        }).catch(async error => {
            this.isLoading = false;
            if (error.alreadyExists)
                await this.alertService.ShowToast("Ciclo já existe", undefined, "warning");
            else if (error.nothingChanged)
                await this.alertService.ShowToast("Nada foi alterado", undefined, "warning");
            else
                await this.alertService.ShowToast((this.exerciseTemplateID) ? "Não foi possível alterar o ciclo" : "Não foi possível criar o ciclo", undefined, "danger");
        });
    }

    async CreateOrUpdateExerciseTemplate(isUpdating?: boolean) {
        if (this.allExerciseTemplates.some(template => template.name == this.templateName) && this.originalName != this.templateName)
            return Promise.reject({alreadyExists: true});
        if (this.originalName == this.templateName && !this.changed)
            return Promise.reject({nothingChanged: true});
        let exerciseIDs: string[] = [];
        for (let exercise of this.addedExercises)
            exerciseIDs.push(exercise.thisObjectID!);
        if (isUpdating)
            await this.updateTemplateAndExercisesOnPractitioners();
        return isUpdating ? this.exercisesService.UpdateExerciseTemplate(this.exerciseTemplateID!, {name: this.templateName, exerciseIDs: exerciseIDs}) : this.exercisesService.CreateExerciseTemplate({name: this.templateName!, exerciseIDs: exerciseIDs});
    }

    //TODO: Use cache and do better error handling
    async updateTemplateAndExercisesOnPractitioners() {
        let addedExercisesWithDefaultWorkload: PractitionerExercise[] = [];
        if (this.changed) {
            for (let exercise of this.addedExercises) {
                let exerciseWithDefaultWorkload: PractitionerExercise = {
                    exerciseID: exercise.thisObjectID!,
                    exercise: exercise,
                    series: 1,
                    repetition: 1,
                    rest: 0,
                    load: 0
                }
                addedExercisesWithDefaultWorkload.push(exerciseWithDefaultWorkload);
            }
        }
        let allPractitioners = await this.practitionerService.GetAllPractitioners();
        for (let practitioner of allPractitioners) {
            if (practitioner.templateName != this.originalName)
                continue;
            let cacheError = false, errorOccurred = false;
            if (this.changed) {
                await this.practitionerService.GetPractitionersExercises(practitioner.exercisesID, true).then(value => practitioner.exercises = value).catch(() => cacheError = true);
                if (cacheError)
                    await this.practitionerService.GetPractitionersExercises(practitioner.exercisesID).then(value => practitioner.exercises = value).catch(() => errorOccurred = true);
                if (!errorOccurred)
                    for (let exercise of practitioner.exercises!) {
                        let exerciseShouldStay = this.addedExercises.some(newExercise => exercise.exerciseID == newExercise.thisObjectID);
                        if (!exerciseShouldStay)
                            await this.practitionerService.RemoveExercise(practitioner.exercisesID, exercise).catch(() => errorOccurred = true);
                    }
                if (!errorOccurred)
                    for (let newExerciseAndWorkload of addedExercisesWithDefaultWorkload) {
                        let shouldAddExercise = !practitioner.exercises!.some(exercisePract => newExerciseAndWorkload.exerciseID == exercisePract.exerciseID);
                        if (shouldAddExercise)
                            await this.practitionerService.AddExercise(practitioner.exercisesID, newExerciseAndWorkload).catch(() => errorOccurred = true);
                    }
            }
            if (!errorOccurred)
                await this.practitionerService.UpdatePractitioner(practitioner.thisObjectID!, {templateName: this.templateName}).catch(() => errorOccurred = true);
            if (errorOccurred) {
                await this.alertService.ShowToast("Ocorreu um erro atualizando os alunos", undefined, "danger");
                return;
            }
        }
    }
}
