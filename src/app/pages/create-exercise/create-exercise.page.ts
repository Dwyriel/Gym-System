import {Component} from '@angular/core';
import {ExerciseTemplate} from "../../interfaces/exercise";
import {ExercisesService} from "../../services/exercises.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertService} from "../../services/alert.service";

@Component({
    selector: 'app-create-exercise',
    templateUrl: './create-exercise.page.html',
    styleUrls: ['./create-exercise.page.scss'],
})
export class CreateExercisePage {
    readonly categoryCreationValue = 1;

    exerciseName: string = "";
    possibleCategories: Array<string> = new Array<string>();
    categorySelected?: string | number;
    newCategoryName: string = "";

    hideCategoryInsertion: boolean = true;
    isLoading: boolean = false;

    idToChangeExercise: string | null = null;

    constructor(private exercisesService: ExercisesService, private router: Router, private activatedRoute: ActivatedRoute, private alertService: AlertService) { }

    IsInsertingCategory() {
        this.hideCategoryInsertion = typeof this.categorySelected != "number";
    }

    async ionViewWillEnter() {
        this.isLoading = true;
        await this.GetUniqueCategories();
        this.idToChangeExercise = this.activatedRoute.snapshot.paramMap.get("id")
        if (this.idToChangeExercise) {
            let exerciseToChange = await this.exercisesService.GetExercise(this.idToChangeExercise);
            this.exerciseName = exerciseToChange.name;
            this.categorySelected = exerciseToChange.category;
        }
        this.isLoading = false;
    }

    async ionViewDidLeave() {
        this.possibleCategories = new Array<string>();
        this.exerciseName = "";
        this.newCategoryName = "";
        this.isLoading = false;
        this.categorySelected = undefined;
    }

    async GetUniqueCategories() {
        let Exercises: Array<ExerciseTemplate> = await this.exercisesService.GetAllExercises();
        Exercises.forEach(item => this.possibleCategories.push(item.category));
        this.possibleCategories = [...new Set(this.possibleCategories)];
    }

    async EnterPressed() {
        if (!(!this.exerciseName || (!this.hideCategoryInsertion && !this.newCategoryName)))
            await this.CreateExercise();
    }

    async OnClick() {
        let functionResult: Promise<any> = (this.idToChangeExercise) ? this.UpdateExercise() : this.CreateExercise();
        await this.router.navigate(["/exercises"]);
        this.isLoading = false;
        functionResult
            .then(async () => await this.alertService.ShowToast((this.idToChangeExercise) ? "Exercício alterado com sucesso" : "Exercício criado com sucesso", undefined, "primary"))
            .catch(async () => await this.alertService.ShowToast((this.idToChangeExercise) ? "Não foi possível alterar o exercício" : "Não foi possível criar o exercício", undefined, "danger"));
    }

    async CreateExercise() {
        this.isLoading = true;
        if (typeof this.categorySelected == "number")
            this.categorySelected = this.newCategoryName;
        return this.exercisesService.CreateExercise({name: this.exerciseName, category: this.categorySelected!});
    }

    async UpdateExercise() {
        this.isLoading = true;
        if (typeof this.categorySelected == "number")
            this.categorySelected = this.newCategoryName;
        return this.exercisesService.UpdateExercise(this.idToChangeExercise!, {name: this.exerciseName, category: this.categorySelected!});
    }

}
