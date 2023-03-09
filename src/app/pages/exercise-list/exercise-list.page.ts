import {Component} from '@angular/core';
import {ExercisesService} from "../../services/exercises.service";
import {Exercise} from "../../interfaces/exercise";
import {PractitionerService} from "../../services/practitioner.service";
import {AlertService} from "../../services/alert.service";
import {waitForFirebaseResponse} from "../../services/app.utility";
import {AccountService} from "../../services/account.service";

interface ExercisesByCategory {
    categoryName: string,
    exercises: Array<Exercise>
}

function sortExerciseByCategory(firstExerc: Exercise, secondExerc: Exercise) {
    let firstLowerCase = firstExerc.category.toLowerCase();
    let secondLowerCase = secondExerc.category.toLowerCase();
    return (firstLowerCase < secondLowerCase) ? -1 : (firstLowerCase > secondLowerCase) ? 1 : 0;
}

@Component({
    selector: 'app-exercise-list',
    templateUrl: './exercise-list.page.html',
    styleUrls: ['./exercise-list.page.scss'],
})
export class ExerciseListPage {
    private readonly minSkeletonTextSize = 150;
    private readonly skeletonTextVariation = 200;
    private readonly skeletonTextNumOfItems = 8;
    private allExercises?: Array<Exercise>;
    private exercisesByCategoryAsString: string = "";
    private previouslyDeleted = false;

    public skeletonTextItems: string[] = [];
    public exercisesByCategory: Array<ExercisesByCategory> = new Array<ExercisesByCategory>();
    public searchFilter: string = "";
    public exercisesArrayIsEmpty = true;
    public fetchingData = true;

    constructor(private exercisesService: ExercisesService, private practitionersService: PractitionerService, private alertService: AlertService, private accountService: AccountService) { }

    async ionViewWillEnter() {
        this.setSkeletonText();
        if (await waitForFirebaseResponse(this.accountService))
            await this.PopulateInterface();
    }

    ionViewDidLeave() {
        this.exercisesByCategory = new Array<ExercisesByCategory>();
        this.allExercises = new Array<Exercise>();
        this.searchFilter = "";
        this.fetchingData = true;
        this.previouslyDeleted = false;
    }

    private setSkeletonText() {
        this.skeletonTextItems = [];
        for (let i = 0; i < this.skeletonTextNumOfItems; i++)
            this.skeletonTextItems.push(`width: ${((Math.random() * this.skeletonTextVariation) + this.minSkeletonTextSize)}px`);
    }

    private async PopulateInterface() {
        this.fetchingData = true;
        this.allExercises = await this.exercisesService.GetAllExercises();
        this.allExercises.sort(sortExerciseByCategory);
        let categories: Array<string> = await this.exercisesService.GetAllCategories(this.allExercises);
        for (let categoryName of categories)
            this.exercisesByCategory.push({categoryName: categoryName, exercises: new Array<Exercise>()});
        for (let i = 0; i < categories.length; i++) {
            for (let exercise of this.allExercises)
                if (exercise.category == this.exercisesByCategory[i].categoryName)
                    this.exercisesByCategory[i].exercises.push(exercise);
        }
        this.exercisesByCategoryAsString = JSON.stringify(this.exercisesByCategory);
        this.exercisesArrayIsEmpty = this.exercisesByCategory.length < 1;
        this.fetchingData = false;
    }

    private RepopulateInterface() {
        this.exercisesByCategory = JSON.parse(this.exercisesByCategoryAsString);
    }

    public async SearchNames(repopulate: boolean = true) {
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

    public async DeleteExerciseBtn(exercise: Exercise) {
        let answer = await this.alertService.ConfirmationAlert("Apagar este exercício?", `"${exercise.name}" desaparecerá para sempre`, "Não", "Sim");
        if (!answer)
            return;
        let id = await this.alertService.PresentLoading("Carregando");
        if (await this.DeleteExercise(exercise.thisObjectID!)) {
            await this.alertService.ShowToast("Exercício apagado com sucesso", undefined, "primary");
            this.exercisesByCategory = JSON.parse(this.exercisesByCategoryAsString);
            for (let [categoriesIndex, categories] of this.exercisesByCategory.entries())
                if (categories.categoryName == exercise.category) {
                    for (let [exercisesIndex, exercises] of categories.exercises.entries())
                        if (exercises.thisObjectID == exercise.thisObjectID)
                            categories.exercises.splice(exercisesIndex, 1);
                    if (categories.exercises.length == 0)
                        this.exercisesByCategory.splice(categoriesIndex, 1);
                }
            this.exercisesByCategoryAsString = JSON.stringify(this.exercisesByCategory);
            await this.SearchNames(false);
        } else
            await this.alertService.ShowToast("Exercício não pode ser apagado", undefined, "danger");
        await this.alertService.DismissLoading(id);
    }

    private async DeleteExercise(exerciseId: string): Promise<boolean> {
        if (!exerciseId)
            return false;
        let errorOccurred = await this.removeFromPractitioners(exerciseId);
        if (!errorOccurred)
            errorOccurred = await this.removeFromTemplates(exerciseId);
        if (errorOccurred)
            return !errorOccurred;
        await this.exercisesService.DeleteExercise(exerciseId).catch(() => errorOccurred = true);
        this.previouslyDeleted = !errorOccurred;
        return !errorOccurred;
    }

    private async removeFromPractitioners(exerciseID: string) {
        let errorOccurred = false;
        let allPractitioners = this.previouslyDeleted ? await this.practitionersService.GetAllPractitionersFromCache() : await this.practitionersService.GetAllPractitioners();
        for (let i = 0; i < allPractitioners.length; i++) {
            let allPractitionerExercises = await this.practitionersService.GetPractitionersExercises(allPractitioners[i].exercisesID);
            for (let j = 0; j < allPractitionerExercises.length; j++)
                if (allPractitionerExercises[j].exerciseID == exerciseID) {
                    await this.practitionersService.RemoveExercise(allPractitioners[i].exercisesID, allPractitionerExercises[j]).catch(() => errorOccurred = true);
                    break;
                }
            if (errorOccurred)
                return errorOccurred;
        }
        return errorOccurred;
    }

    private async removeFromTemplates(exerciseID: string) {
        let errorOccurred = false;
        let allTemplates = this.previouslyDeleted ? await this.exercisesService.GetAllExerciseTemplatesFromCache() : await this.exercisesService.GetAllExerciseTemplates();
        for (let i = 0; i < allTemplates.length; i++) {
            for (let j = 0; j < allTemplates[i].exerciseIDs.length; j++)
                if (exerciseID === allTemplates[i].exerciseIDs[j]) {
                    allTemplates[i].exerciseIDs.splice(j, 1);
                    await this.exercisesService.UpdateExerciseTemplate(allTemplates[i].thisObjectID!, {exerciseIDs: allTemplates[i].exerciseIDs}).catch(() => errorOccurred = true);
                    break;
                }
            if (errorOccurred)
                return errorOccurred;
        }
        return errorOccurred;
    }
}
