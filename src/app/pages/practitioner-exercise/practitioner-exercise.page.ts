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
        let id = await this.alertService.PresentLoading("Carregando");
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");

        await this.practitionerService.GetPractitioner(this.practitionerID!).then(result => {
            this.practitionerInfo = result;
            this.isLoading = false;
        }).catch(async () => await this.router.navigate(['practitioner-list']));

        await this.populateExerciseList();

        this.allExercises = await this.exercisesService.GetAllExercises();
        this.isLoading = false;
        await this.alertService.DismissLoading(id);
    }

    ionViewDidLeave() {
        this.isLoading = false;
        this.hasExercises = true;
        this.practitionerInfo = undefined;
        this.practitionerExercises = undefined;
        this.allExercises = undefined;
        this.practitionerID = null;
    }

    public async addExerciseBtn() {
        const unusedExercises = this.removeRepeatedExercises();
        const addExercisePopover = await this.popoverController.create({
            component: SelectExerciseAndWorkloadComponent,
            mode: 'md',
            componentProps: {exercisesInput: unusedExercises},
            animated: true
        });
        addExercisePopover.onDidDismiss().then(async value => {
            if (value.data) {
                let id = await this.alertService.PresentLoading("Carregando");
                await this.practitionerService.AddExercise(this.practitionerInfo!.exercisesID, value.data.selectedExercise);
                await this.populateExerciseList();
                await this.alertService.DismissLoading(id);
            }
        });
        await addExercisePopover.present();
    }

    public async removeExerciseBtn(exercise: Exercise) {
        let confirmation = await this.alertService.ConfirmationAlert("Deseja remover este exercício?", undefined, "Não", "Sim");
        if (!this.practitionerInfo?.exercisesID || !confirmation)
            return;
        let id = await this.alertService.PresentLoading("Carregando");
        await this.practitionerService.RemoveExercise(this.practitionerInfo?.exercisesID, exercise);
        await this.populateExerciseList();
        await this.alertService.DismissLoading(id);
    }

    private async populateExerciseList() {
        this.practitionerExercises = await this.practitionerService.GetPractitionersExercises(this.practitionerInfo!.exercisesID);
        this.hasExercises = (typeof this.practitionerExercises != "undefined" && this.practitionerExercises.length > 0);
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
