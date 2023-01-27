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
    private allExercises?: Array<ExerciseTemplate>;
    public exercisesByCategory: Array<ExercisesByCategory> = new Array<ExercisesByCategory>();


    constructor(private exercisesService: ExercisesService, private practitionersService: PractitionerService, private alertService: AlertService) { }

    async ionViewWillEnter() {
        await this.PopulateInterface();
    }
    ionViewDidLeave() {
        this.exercisesByCategory = new Array<ExercisesByCategory>();
        this.allExercises = new Array<ExerciseTemplate>();
    }

    async PopulateInterface() {
        this.allExercises = await this.exercisesService.GetAllExercises();
        let categories: Array<string> = await this.exercisesService.GetAllCategories(this.allExercises);
        categories.forEach(categoryName => this.exercisesByCategory.push({categoryName, exercises: new Array<ExerciseTemplate>()}));

        for (let i = 0; i < categories.length; i++){
            this.allExercises.forEach(exercise => {
                if (exercise.category == this.exercisesByCategory[i].categoryName)
                    this.exercisesByCategory[i].exercises.push(exercise);
            });
        }
    }

    async DeleteExerciseBtn(exercise: ExerciseTemplate) {
        let answer = await this.alertService.ConfirmationAlert("Apagar este exercício?", `"${exercise.name}" desaparecerá para sempre`, "Não", "Sim");
        if (answer) {
            if (await this.DeleteExercise(exercise.thisObjectID!)) {
                await this.alertService.ShowToast("Exercício apagado com sucesso", undefined, "primary");
                this.exercisesByCategory.forEach((categories, categoriesIndex) => {
                    if (categories.categoryName == exercise.category) {
                        categories.exercises.forEach((exercises, exercisesIndex) => {
                            if (exercises.thisObjectID == exercise.thisObjectID)
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

interface ExercisesByCategory {
    categoryName: string,
    exercises: Array<ExerciseTemplate>
}
