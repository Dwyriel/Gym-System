import {Component, OnInit} from '@angular/core';
import {PopoverController} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {SelectExerciseAndWorkloadComponent} from "../../components/select-exercise-and-workload/select-exercise-and-workload.component";
import {AccountService} from "../../services/account.service";
import {ExercisesService} from "../../services/exercises.service";
import {AlertService} from "../../services/alert.service";
import {Exercise} from "../../interfaces/exercise";
import {ExerciseTemplate} from "../../interfaces/exercise-template";
import {AppInfoService} from "../../services/app-info.service";

function sortByCategory(firstExerc: Exercise, secondExerc: Exercise) {
    let firstLowerCase = firstExerc.category.toLowerCase();
    let secondLowerCase = secondExerc.category.toLowerCase();
    return (firstLowerCase < secondLowerCase) ? -1 : (firstLowerCase > secondLowerCase) ? 1 : 0;
}

@Component({
    selector: 'app-exercise-template-form',
    templateUrl: './exercise-template-form.page.html',
    styleUrls: ['./exercise-template-form.page.scss'],
})
export class ExerciseTemplateFormPage implements OnInit {
    private allExercises: Exercise[] = [];
    private allExerciseTemplates: ExerciseTemplate[] = [];

    public exerciseTemplateID: string | null = null;
    public templateName?: string;
    public addedExercises: Exercise[] = [];
    public isLoading = true;

    constructor(private router: Router, private activatedRoute: ActivatedRoute, private accountService: AccountService, private exercisesService: ExercisesService, private popoverController: PopoverController, private alertService: AlertService) { }

    ngOnInit() {
    }

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
                this.templateName = value.name;
                this.exercisesService.GetTemplatesExercises(value.exerciseIDs).then(value1 => {
                    this.addedExercises = value1;
                    this.addedExercises.sort(sortByCategory);
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

    get checkIfSendConditionsAreMet() {
        return this.templateName && this.addedExercises.length > 0;
    }

    get filteredExercisesArray() {
        let exercisesNotYetAdded: Exercise[] = [];
        for (let exercise of this.allExercises) {
            if (!this.addedExercises.some(value => value.category === exercise.category && value.name === exercise.name))
                exercisesNotYetAdded.push(exercise);
        }
        return exercisesNotYetAdded.sort(sortByCategory);
    }

    onRemoveExerciseButtonClick(exercise: Exercise) {
        this.addedExercises.splice(this.addedExercises.findIndex(value => value.category == exercise.category && value.name == exercise.name), 1);
    }

    async onAddExerciseButtonClick() {
        const addExercisePopover = await this.popoverController.create({
            component: SelectExerciseAndWorkloadComponent,
            mode: 'md',
            componentProps: {exercisesInput: this.filteredExercisesArray, onlyExercise: true},
            animated: true
        });
        addExercisePopover.onDidDismiss().then(async value => {
            if (value.data) {
                this.addedExercises.push(value.data.selectedExercise.exercise);
                this.addedExercises.sort(sortByCategory);
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
            await this.alertService.ShowToast("Dispositivo não esta conectado a internet", undefined, "danger");
            return;
        }
        this.isLoading = true;
        let functionResult: Promise<any> = this.CreateOrUpdateExerciseTemplate(Boolean(this.exerciseTemplateID));
        await functionResult.then(async () => {
            await this.alertService.ShowToast((this.exerciseTemplateID) ? "Ciclo alterado com sucesso" : "Ciclo criado com sucesso", undefined, "primary");
            await this.router.navigate(["/home"]);//todo verify
        }).catch(async () => {
            this.isLoading = false;
            await this.alertService.ShowToast((this.exerciseTemplateID) ? "Não foi possível alterar o ciclo" : "Não foi possível criar o ciclo", undefined, "danger");
        });
    }

    async CreateOrUpdateExerciseTemplate(isUpdating?: boolean) {
        let exerciseIDs: string[] = [];
        for (let exercise of this.addedExercises)
            exerciseIDs.push(exercise.thisObjectID!);
        return isUpdating ? this.exercisesService.UpdateExerciseTemplate(this.exerciseTemplateID!, {name: this.templateName, exerciseIDs: exerciseIDs}) : this.exercisesService.CreateExerciseTemplate({name: this.templateName!, exerciseIDs: exerciseIDs});
    }
}
