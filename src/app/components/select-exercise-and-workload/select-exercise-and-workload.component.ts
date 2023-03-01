import {Component, Input, OnInit} from '@angular/core';
import {PopoverController} from "@ionic/angular";
import {Exercise, ExerciseTemplate} from "../../interfaces/exercise";
import {ExercisesService} from "../../services/exercises.service";

@Component({
    selector: 'app-select-exercise-and-workload',
    templateUrl: './select-exercise-and-workload.component.html',
    styleUrls: ['./select-exercise-and-workload.component.scss'],
})
export class SelectExerciseAndWorkloadComponent implements OnInit {

    @Input("exercisesInput") private exercisesInput: Array<ExerciseTemplate> = [];

    public categories: string[] = [];
    public exercises: Array<ExerciseTemplate> = []
    public selectedCategory: string = "";
    public selectedExerciseTemplate?: ExerciseTemplate;
    public series?: number;
    public repetition?: number;
    public rest?: number;
    public load?: number;
    public selectedExercise?: Exercise;

    constructor(private popoverController: PopoverController, private exerciseService: ExercisesService) { }

    async ngOnInit() {
        this.categories = await this.exerciseService.GetAllCategories(this.exercisesInput);
    }

    selectedCategoryChanged() {
        this.exercises = [];
        this.selectedExerciseTemplate = undefined;
        this.exercisesInput.forEach(exercise => {
            if (exercise.category == this.selectedCategory)
                this.exercises.push(exercise);
        })
    }

    EnterPressed() {
        if (!this.selectedCategory || !this.selectedExerciseTemplate || !this.series || !this.repetition || !this.rest || !this.load)
            return;
        this.onButtonClick();
    }

    onButtonClick() {
        this.selectedExercise = {exerciseID: this.selectedExerciseTemplate!.thisObjectID!, exercise: this.selectedExerciseTemplate, series: this.series!, repetition: this.repetition!, rest: this.rest!, load: this.load!};
        this.popoverController.dismiss({selectedExercise: this.selectedExercise});
    }
}
