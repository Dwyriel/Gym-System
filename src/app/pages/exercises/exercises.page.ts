import {Component} from '@angular/core';
import {ExercisesService} from "../../services/exercises.service";
import {ExerciseTemplate} from "../../interfaces/exercises";

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.page.html',
  styleUrls: ['./exercises.page.scss'],
})
export class ExercisesPage {
    allExercises?: Array<ExerciseTemplate>;
    exercisesByCategory: Array<{category: string, exercises: Array<ExerciseTemplate>}> = new Array<{category: string; exercises: Array<ExerciseTemplate>}>();


    constructor(private exercisesService: ExercisesService) { }

    async ionViewWillEnter() {
        this.allExercises = await this.exercisesService.GetAllExercises();
        let categories: Array<string> = new Array<string>();
        this.allExercises.forEach(item => categories.push(item.category));
        categories = [...new Set(categories!)];

        categories.forEach(category => this.exercisesByCategory.push({category, exercises: new Array<ExerciseTemplate>()}));

        for (let i = 0; i < categories.length; i++){
            this.allExercises.forEach(exercise => {
                if (exercise.category == this.exercisesByCategory[i].category)
                    this.exercisesByCategory[i].exercises.push(exercise);
            });
        }
    }
    ionViewDidLeave() {
        this.exercisesByCategory = new Array<{category: string; exercises: Array<ExerciseTemplate>}>();
        this.allExercises = new Array<ExerciseTemplate>();
    }
}
