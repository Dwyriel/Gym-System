import { Component, OnInit } from '@angular/core';
import { ExerciseTemplate } from "../../interfaces/exercises";
import {ExercisesService} from "../../services/exercises.service";
import {ActivatedRoute, Router, RouterState} from "@angular/router";
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
    categorySelected: string | number = 1;
    newCategoryName: string = "";

    hideCategoryInsertion: boolean = false;
    isLoading: boolean = false;
    isChanging: boolean = false;

    idToChangeExercise: string | null = null;

    constructor(private exercisesService: ExercisesService, private router: Router, private activatedRoute: ActivatedRoute, private alertService: AlertService) { }

    IsInsertingCategory() {
        this.hideCategoryInsertion = !(typeof this.categorySelected == "number");
    }

    async ionViewWillEnter() {
        await this.GetUniqueCategories();
        this.idToChangeExercise = this.activatedRoute.snapshot.paramMap.get("id")
        if (this.idToChangeExercise) {

        }
    }

    async ionViewDidLeave() {
        this.possibleCategories = new Array<string>();
        this.exerciseName = "";
        this.newCategoryName = "";
        this.isLoading = false;
        this.categorySelected = 1;
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

    async CreateExercise() {
        this.isLoading = true;
        if (typeof this.categorySelected == "number")
            this.categorySelected = this.newCategoryName;
        await this.exercisesService.CreateExercise({name: this.exerciseName, category: this.categorySelected});
        this.exerciseName = "";
        this.newCategoryName = "";
        this.categorySelected = 1;
        await this.router.navigate(["/exercises"]);
        this.isLoading = false;
        await this.alertService.ShowToast("Exercício criado com sucesso", undefined, "primary");
    }

    async ChangeExercise() {
        this.isLoading = true;
        if (typeof this.categorySelected == "number")
            this.categorySelected = this.newCategoryName;
        await this.exercisesService.UpdateExercise(this.idToChangeExercise!, {name: this.exerciseName, category: this.categorySelected});
        this.exerciseName = "";
        this.newCategoryName = "";
        this.categorySelected = 1;
        await this.router.navigate(["/exercises"]);
        this.isLoading = false;
        await this.alertService.ShowToast("Exercício alterado com sucesso", undefined, "primary");
    }
}