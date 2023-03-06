import {Component, OnInit} from '@angular/core';
import {PopoverController} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {SelectExerciseAndWorkloadComponent} from "../../components/select-exercise-and-workload/select-exercise-and-workload.component";
import {AccountService} from "../../services/account.service";
import {ExercisesService} from "../../services/exercises.service";
import {AlertService} from "../../services/alert.service";
import {Exercise} from "../../interfaces/exercise";
import {ExerciseTemplate} from "../../interfaces/exercise-template";

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
        this.getAllInfos();
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
                this.exercisesService;
                this.addedExercises
            });
        await this.getExercises();
        await this.getExerciseTemplates();
    }

    async getExercises() {
        await this.exercisesService.GetAllExercises().then(value => this.allExercises = value).catch(async () => await this.alertService.ShowToast("Ocorreu um erro carregando as informações", undefined, "danger"));
    }

    async getExerciseTemplates() {
        let cacheError = false, errorOccurred = false;
        await this.exercisesService.GetAllExerciseTemplatesFromCache().then(value => this.allExerciseTemplates = value).catch(() => cacheError = true);
        if (cacheError)
            await this.exercisesService.GetAllExerciseTemplates().then(value => this.allExerciseTemplates = value).catch(() => {
                errorOccurred = true;
                this.alertService.ShowToast("Ocorreu um erro carregando as informações", undefined, "danger");
            });
        return errorOccurred;
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

    }
}
