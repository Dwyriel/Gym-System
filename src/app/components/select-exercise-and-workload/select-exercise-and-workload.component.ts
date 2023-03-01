import {Component, Input, OnInit} from '@angular/core';
import {PopoverController} from "@ionic/angular";
import {ExerciseTemplate} from "../../interfaces/exercise";
import {ExercisesService} from "../../services/exercises.service";
import {acceptOnlyInteger} from "../../services/app.utility";

interface Workload {
    series?: number;
    repetition?: number;
    rest?: number;
    load?: number;
}

@Component({
    selector: 'app-select-exercise-and-workload',
    templateUrl: './select-exercise-and-workload.component.html',
    styleUrls: ['./select-exercise-and-workload.component.scss'],
})
export class SelectExerciseAndWorkloadComponent implements OnInit {
    @Input("exercisesInput") private exercisesInput: Array<ExerciseTemplate> = [];
    @Input("workloadInput") public workloadInput?: Workload;

    public isEditing: boolean = false;
    public categories: string[] = [];
    public exercises: Array<ExerciseTemplate> = []
    public selectedCategory: string = "";
    public selectedExerciseTemplate?: ExerciseTemplate;

    constructor(private popoverController: PopoverController, private exerciseService: ExercisesService) { }

    async ngOnInit() {
        this.isEditing = this.workloadInput != undefined;
        if (this.isEditing)
            return;
        this.workloadInput = {series: undefined, repetition: undefined, rest: undefined, load: undefined};
        this.categories = await this.exerciseService.GetAllCategories(this.exercisesInput);
    }

    closePopover() {
        this.popoverController.dismiss();
    }

    selectedCategoryChanged() {
        this.exercises = [];
        this.selectedExerciseTemplate = undefined;
        this.exercisesInput.forEach(exercise => {
            if (exercise.category == this.selectedCategory)
                this.exercises.push(exercise);
        })
    }

    public checkForInvalidCharacters(event: KeyboardEvent) {
        acceptOnlyInteger(event);
    }

    EnterPressed() {
        if (!this.selectedCategory || !this.selectedExerciseTemplate || !this.workloadInput!.series || !this.workloadInput!.repetition || !this.workloadInput!.rest || !this.workloadInput!.load)
            return;
        this.onButtonClick();
    }

    onButtonClick() {
        this.popoverController.dismiss({
            selectedExercise: !this.isEditing ? {exerciseID: this.selectedExerciseTemplate!.thisObjectID!, exercise: this.selectedExerciseTemplate, series: this.workloadInput!.series, repetition: this.workloadInput!.repetition, rest: this.workloadInput!.rest, load: this.workloadInput!.load} : null,
            updatedWorkload: this.isEditing ? this.workloadInput : null
        });
    }
}
