import {Component} from '@angular/core';
import {ExercisesService} from "../../services/exercises.service";
import {ExerciseTemplate} from "../../interfaces/exercise";
import {PractitionerService} from "../../services/practitioner.service";
import {AlertService} from "../../services/alert.service";
import {waitForFirebaseResponse} from "../../services/app.utility";
import {AccountService} from "../../services/account.service";

interface ExercisesByCategory {
    categoryName: string,
    exercises: Array<ExerciseTemplate>
}

@Component({
    selector: 'app-exercises',
    templateUrl: './exercises.page.html',
    styleUrls: ['./exercises.page.scss'],
})
export class ExercisesPage {
    private allExercises?: Array<ExerciseTemplate>;
    private exercisesByCategoryAsString: string = "";

    public exercisesByCategory: Array<ExercisesByCategory> = new Array<ExercisesByCategory>();
    public searchFilter: string = "";
    public exercisesArrayIsEmpty = true;
    public fetchingData = true;

    constructor(private exercisesService: ExercisesService, private practitionersService: PractitionerService, private alertService: AlertService, private accountService: AccountService) { }

    async ionViewWillEnter() {
        let id = await this.alertService.PresentLoading("Carregando");
        if (await waitForFirebaseResponse(this.accountService))
            await this.PopulateInterface();
        await this.alertService.DismissLoading(id);
    }

    ionViewDidLeave() {
        this.exercisesByCategory = new Array<ExercisesByCategory>();
        this.allExercises = new Array<ExerciseTemplate>();
        this.searchFilter = "";
        this.fetchingData = true;
    }

    async PopulateInterface() {
        this.fetchingData = true;
        this.allExercises = await this.exercisesService.GetAllExercises();
        let categories: Array<string> = await this.exercisesService.GetAllCategories(this.allExercises);
        categories.forEach(categoryName => this.exercisesByCategory.push({categoryName, exercises: new Array<ExerciseTemplate>()}));

        for (let i = 0; i < categories.length; i++) {
            this.allExercises.forEach(exercise => {
                if (exercise.category == this.exercisesByCategory[i].categoryName)
                    this.exercisesByCategory[i].exercises.push(exercise);
            });
        }
        this.exercisesByCategoryAsString = JSON.stringify(this.exercisesByCategory);
        this.exercisesArrayIsEmpty = this.exercisesByCategory.length < 1;
        this.fetchingData = false;
    }

    async DeleteExerciseBtn(exercise: ExerciseTemplate) {
        let answer = await this.alertService.ConfirmationAlert("Apagar este exercício?", `"${exercise.name}" desaparecerá para sempre`, "Não", "Sim");
        if (!answer)
            return;
        if (await this.DeleteExercise(exercise.thisObjectID!)) {
            await this.alertService.ShowToast("Exercício apagado com sucesso", undefined, "primary");
            this.exercisesByCategory = JSON.parse(this.exercisesByCategoryAsString);
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
            this.exercisesByCategoryAsString = JSON.stringify(this.exercisesByCategory);
            await this.SearchNames(false);
        } else
            await this.alertService.ShowToast("Exercício não pode ser apagado", undefined, "danger");
    }

    async DeleteExercise(exerciseId: string): Promise<boolean> {
        if (!exerciseId)
            return false;
        let shouldWait = true, returnValue = false;
        let allPractitioners = await this.practitionersService.GetAllPractitioners();
        for (let i = 0; i < allPractitioners.length; i++) {
            let allExercises = await this.practitionersService.GetPractitionersExercises(allPractitioners[i].exercisesID);
            for (let j = 0; j < allExercises.length; j++)
                if (allExercises[j].exerciseID == exerciseId)
                    await this.practitionersService.RemoveExercise(allPractitioners[i].exercisesID, allExercises[j]);
        }
        await this.exercisesService.DeleteExercise(exerciseId).then(() => {
            returnValue = true;
            shouldWait = false;
        }).catch(err => {
            returnValue = false;
            shouldWait = false;
            console.log(err);
        });
        while (shouldWait)
            await new Promise(resolve => setTimeout(resolve, 10));
        return returnValue;
    }

    RepopulateInterface() {
        this.exercisesByCategory = JSON.parse(this.exercisesByCategoryAsString);
    }

    async SearchNames(repopulate: boolean = true) {
        if (repopulate)
            this.RepopulateInterface();
        for (let i = 0; i < this.exercisesByCategory.length; i++) {
            for (let j = 0; j < this.exercisesByCategory[i].exercises.length; j++) {
                let name = this.exercisesByCategory[i].exercises[j].name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
                if (!name.includes(this.searchFilter.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, ""))) {
                    this.exercisesByCategory[i].exercises.splice(j, 1);
                    j--;
                }
            }
            if (this.exercisesByCategory[i].exercises.length == 0) {
                this.exercisesByCategory.splice(i, 1);
                i--;
            }
        }
    }
}
