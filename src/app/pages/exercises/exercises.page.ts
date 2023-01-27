import {Component} from '@angular/core';
import {ExercisesService} from "../../services/exercises.service";
import {ExerciseTemplate} from "../../interfaces/exercise";
import {PractitionerService} from "../../services/practitioner.service";
import {AlertService} from "../../services/alert.service";

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.page.html',
  styleUrls: ['./exercises.page.scss'],
})
export class ExercisesPage {
    allExercises?: Array<ExerciseTemplate>;
    exercisesByCategory: Array<{category: string, exercises: Array<ExerciseTemplate>}> = new Array<{category: string; exercises: Array<ExerciseTemplate>}>();


    constructor(private exercisesService: ExercisesService, private practitionersService: PractitionerService, private alertService: AlertService) { }

    async ionViewWillEnter() {
        await this.PopulateInterface();
    }
    ionViewDidLeave() {
        this.exercisesByCategory = new Array<{category: string; exercises: Array<ExerciseTemplate>}>();
        this.allExercises = new Array<ExerciseTemplate>();
    }

    async PopulateInterface() {
        this.allExercises = await this.exercisesService.GetAllExercises();
        let categories: Array<string> = await this.exercisesService.GetAllCategories(this.allExercises);
        categories.forEach(category => this.exercisesByCategory.push({category, exercises: new Array<ExerciseTemplate>()}));

        for (let i = 0; i < categories.length; i++){
            this.allExercises.forEach(exercise => {
                if (exercise.category == this.exercisesByCategory[i].category)
                    this.exercisesByCategory[i].exercises.push(exercise);
            });
        }
    }

    async DeleteExerciseBtn(exerciseId: string, categoryName: string) {
        let answer = await this.alertService.ConfirmationAlert("Deseja apagar este exercício?", undefined, "Não", "Sim");
        if (answer) {
            if (await this.DeleteExercise(exerciseId)) {
                await this.alertService.ShowToast("Exercício apagado com sucesso", undefined, "primary");

                this.exercisesByCategory.forEach((categories, categoriesIndex) => {
                    if (categories.category == categoryName) {
                        categories.exercises.forEach( (exercises, exercisesIndex) => {
                            if (exercises.thisObjectID == exerciseId)
                                categories.exercises.splice(exercisesIndex, 1);
                        });
                        if (categories.exercises.length == 0)
                            this.exercisesByCategory.splice(categoriesIndex, 1);
                    }
                    });
            }
            else
                await this.alertService.ShowToast("Exercício não pode ser apagado", undefined, "danger");
        }
    }

    async DeleteExercise(exerciseId: string): Promise<boolean> {
        if (!exerciseId)
            return false;
        let allPractitioners = await this.practitionersService.GetAllPractitioners();
        for (let i = 0; i < allPractitioners.length; i++) {
            let allExercises = await this.practitionersService.GetPractitionersExercises(allPractitioners[i].exercisesID);
            for (let j = 0; j < allExercises.length; j++)
                if (allExercises[j].exerciseID == exerciseId)
                    await this.practitionersService.RemoveExercise(allPractitioners[i].exercisesID, allExercises[j]);
        }
        await this.exercisesService.DeleteExercise(exerciseId);
        return true;
    }
}
