import {Component} from '@angular/core';
import {waitForFirebaseResponse} from "../../services/app.utility";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService} from "../../services/account.service";
import {PractitionerService} from "../../services/practitioner.service";
import {AlertService} from "../../services/alert.service";
import {Practitioner} from "../../classes/practitioner";
import {Exercise, ExerciseTemplate} from "../../interfaces/exercise";
import {ExercisesService} from "../../services/exercises.service";
import {PopoverController} from "@ionic/angular";
import {SelectExerciseAndWorkloadComponent} from "../../components/select-exercise-and-workload/select-exercise-and-workload.component";
import {AppInfoService} from "../../services/app-info.service";

@Component({
    selector: 'app-practitioner-exercise',
    templateUrl: './practitioner-exercise.page.html',
    styleUrls: ['./practitioner-exercise.page.scss'],
})
export class PractitionerExercisePage {
    public readonly minWidthForFullText = 700
    public practitionerInfo?: Practitioner;
    public practitionerExercises?: Exercise[];
    public allExercises?: ExerciseTemplate[];
    public isLoading = false;
    public hasExercises = true;
    public practitionerID: string | null = null;
    public appWidth = AppInfoService.AppInfo;

    constructor(private router: Router, private activatedRoute: ActivatedRoute, private accountService: AccountService, private practitionerService: PractitionerService, private exercisesService: ExercisesService, private popoverController: PopoverController, private alertService: AlertService) { }

    async ionViewWillEnter() {
        this.isLoading = true;
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");
        let errorOccurred = false;
        await this.practitionerService.GetPractitioner(this.practitionerID!).then(result => this.practitionerInfo = result).catch(() => errorOccurred = true);//TODO from cache
        if (errorOccurred) {
            await this.alertService.ShowToast("Ocorreu um erro carregando as informações", undefined, "danger");
            return
        }
        this.allExercises = await this.exercisesService.GetAllExercises();
        await this.populateExerciseList();
    }

    ionViewDidLeave() {
        this.isLoading = false;
        this.hasExercises = true;
        this.practitionerInfo = undefined;
        this.practitionerExercises = undefined;
        this.allExercises = undefined;
        this.practitionerID = null;
    }

    public async onClick(exercise?: Exercise) {
        if (!exercise) {
            await this.addExerciseBtn();
            return;
        }
        const selection = await this.alertService.ConfirmationAlertThreeButtons("Editar ou excluir?", undefined, "Editar", "Excluir", "Cancelar");
        if (selection == 0)
            return;
        else if (selection == 2)
            await this.editExerciseBtn(exercise);
        else if (selection == 1)
            await this.removeExerciseBtn(exercise);
    }

    private async addExerciseBtn() {
        const unusedExercises = this.removeRepeatedExercises();
        const addExercisePopover = await this.popoverController.create({
            component: SelectExerciseAndWorkloadComponent,
            mode: 'md',
            componentProps: {exercisesInput: unusedExercises},
            animated: true
        });
        addExercisePopover.onDidDismiss().then(async value => {
            if (value.data) {
                this.isLoading = true;
                await this.practitionerService.AddExercise(this.practitionerInfo!.exercisesID, value.data.selectedExercise)
                    .catch(async () => await this.alertService.ShowToast("Não foi possível adicionar o exercício", undefined, "danger"));
                await this.populateExerciseList();
            }
        });
        await addExercisePopover.present();
    }

    private async editExerciseBtn(oldExercise: Exercise) {
        const editExercisePopover = await this.popoverController.create({
            component: SelectExerciseAndWorkloadComponent,
            mode: 'md',
            componentProps: {workloadInput: {series: oldExercise.series, repetition: oldExercise.repetition, rest: oldExercise.rest, load: oldExercise.load}},
            animated: true
        });
        editExercisePopover.onDidDismiss().then(async value => {
            if (value.data) {
                this.isLoading = true;
                let newExercise: Exercise = {
                    exerciseID: oldExercise.exerciseID,
                    exercise: oldExercise.exercise,
                    series: value.data.updatedWorkload!.series,
                    repetition: value.data.updatedWorkload!.repetition,
                    rest: value.data.updatedWorkload!.rest,
                    load: value.data.updatedWorkload!.load
                };
                await this.updateEditedExercise(oldExercise, newExercise);
            }
        });
        await editExercisePopover.present();
    }

    async updateEditedExercise(oldExercise: Exercise, newExercise: Exercise) {
        let errorOcurred = false;
        if (oldExercise.series == newExercise.series && oldExercise.repetition == newExercise.repetition && oldExercise.rest == newExercise.rest && oldExercise.load == newExercise.load)
            return;
        await this.practitionerService.RemoveExercise(this.practitionerInfo!.exercisesID, oldExercise).catch(() => errorOcurred = true);
        if (!errorOcurred)
            await this.practitionerService.AddExercise(this.practitionerInfo!.exercisesID, newExercise).catch(() => errorOcurred = true);
        if (errorOcurred)
            await this.alertService.ShowToast("Não foi possível editar o exercício", undefined, "danger");
        await this.populateExerciseList();
    }

    public async removeExerciseBtn(exercise: Exercise) {
        let confirmation = await this.alertService.ConfirmationAlert("Deseja remover este exercício?", undefined, "Não", "Sim");
        if (!this.practitionerInfo?.exercisesID || !confirmation)
            return;
        this.isLoading = true;
        await this.practitionerService.RemoveExercise(this.practitionerInfo?.exercisesID, exercise)
            .catch(async () => await this.alertService.ShowToast("Não foi possível remover o exercício", undefined, "danger"));
        await this.populateExerciseList();
        this.isLoading = false;
    }

    private async populateExerciseList(fromCache = false) {//TODO from cache
        this.isLoading = true;
        this.practitionerExercises = await this.practitionerService.GetPractitionersExercises(this.practitionerInfo!.exercisesID);
        this.hasExercises = (typeof this.practitionerExercises != "undefined" && this.practitionerExercises.length > 0);
        this.isLoading = false;
    }

    private removeRepeatedExercises() {
        let newList: ExerciseTemplate[] = [];
        this.allExercises?.forEach(exer => {
            let canAdd = true;
            this.practitionerExercises?.forEach(pracExer => {
                if (exer.thisObjectID == pracExer.exercise?.thisObjectID)
                    canAdd = false;
            });
            if (canAdd)
                newList.push(exer);
        });
        return newList;
    }
}
