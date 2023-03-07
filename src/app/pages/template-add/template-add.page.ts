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

@Component({
    selector: 'app-template-add',
    templateUrl: './template-add.page.html',
    styleUrls: ['./template-add.page.scss'],
})
export class TemplateAddPage {
    public practitionerID: string | null = null;
    public practitionerInfo?: Practitioner;
    public templatesList: ExerciseTemplate[] = [];
    public selectedTemplateName = "";
    public selectedTemplate?: ExerciseTemplate;
    public checkedExercises: PractitionerExercise[] = [];
    public isLoading = false;

    constructor(private accountService: AccountService, private activatedRoute: ActivatedRoute, private practitionerService: PractitionerService, private exercisesService: ExercisesService, private alertService: AlertService, private router: Router, private popoverController: PopoverController) { }

    async ionViewWillEnter() {
        this.isLoading = true;
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");
        let cacheError = false, errorOccurred = false;
        await this.practitionerService.GetPractitionerFromCache(this.practitionerID!).then(result => this.practitionerInfo = result).catch(() => cacheError = true);
        if(cacheError)
            await this.practitionerService.GetPractitioner(this.practitionerID!).then(result => this.practitionerInfo = result).catch(() => errorOccurred = true);
        if (errorOccurred) {
            await this.alertService.ShowToast("Ocorreu um erro carregando as informações", undefined, "danger");
            return;
        }

        this.templatesList = await this.exercisesService.GetAllExerciseTemplates();
        for (let template of this.templatesList) {
            template.exercises = [];
            for (let id of template.exerciseIDs)
                template.exercises?.push(await this.exercisesService.GetExercise(id));
        }


        this.isLoading = false;
    }

    ionViewDidLeave() {
    }

    public changedTemplate(name: string) {
        for (let template of this.templatesList)
            if (template.name == name) {
                this.selectedTemplate = template;
                return;
            }
    }

    public async OnCheck(exercise: Exercise) {
        for (let [index, checkedExercise] of this.checkedExercises.entries()) {
            if (checkedExercise.exerciseID == exercise.thisObjectID) {
                this.checkedExercises.splice(index, 1);
                console.log(this.checkedExercises);
                return;
            }
        }

        const editExercisePopover = await this.popoverController.create({
            component: SelectExerciseAndWorkloadComponent,
            mode: 'md',
            componentProps: {workloadInput: {series: 1, repetition: 1, rest: 0, load: 0}},
            animated: true
        });
        editExercisePopover.onDidDismiss().then(async value => {
            let newExercise: PractitionerExercise = {
                exerciseID: exercise.thisObjectID!,
                exercise: exercise,
                series: 1,
                repetition: 1,
                rest: 0,
                load: 0
            };
            if (value.data) {
                newExercise.series = value.data.updatedWorkload!.series;
                newExercise.repetition = value.data.updatedWorkload!.repetition;
                newExercise.rest = value.data.updatedWorkload!.rest;
                newExercise.load = value.data.updatedWorkload!.load;
            }
            this.checkedExercises.push(newExercise);
        });
        await editExercisePopover.present();
    }

}
