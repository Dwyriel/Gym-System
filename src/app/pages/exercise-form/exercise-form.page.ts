import {Component} from '@angular/core';
import {waitForFirebaseResponse} from "../../services/app.utility";
import {ExerciseTemplate} from "../../interfaces/exercise";
import {ExercisesService} from "../../services/exercises.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertService} from "../../services/alert.service";
import {AccountService} from "../../services/account.service";
import {AppInfoService} from "../../services/app-info.service";

@Component({
    selector: 'app-exercise-form',
    templateUrl: './exercise-form.page.html',
    styleUrls: ['./exercise-form.page.scss'],
})
export class ExerciseFormPage {
    public readonly categoryCreationValue = 1;
    public exerciseName: string = "";
    public categorySelected?: string | number;
    public possibleCategories: Array<string> = new Array<string>();
    public newCategoryName: string = "";

    public exercises: ExerciseTemplate[] = [];
    public idToChangeExercise: string | null = null;
    public hideCategoryInsertion: boolean = true;
    public isLoading: boolean = false;

    constructor(private exercisesService: ExercisesService, private router: Router, private activatedRoute: ActivatedRoute, private alertService: AlertService, private accountService: AccountService) { }

    async ionViewWillEnter() {
        this.isLoading = true;
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
        await this.GetExerciseAndUniqueCategories();
        this.idToChangeExercise = this.activatedRoute.snapshot.paramMap.get("id");
        if (this.idToChangeExercise)
            await this.GetExerciseFromFirebase();
        this.isLoading = false;
    }

    async ionViewDidLeave() {
        this.possibleCategories = new Array<string>();
        this.exerciseName = "";
        this.newCategoryName = "";
        this.isLoading = false;
        this.categorySelected = undefined;
    }

    async GetExerciseAndUniqueCategories() {
        this.exercises = await this.exercisesService.GetAllExercises();
        for (let exercise of this.exercises)
            this.possibleCategories.push(exercise.category);
        this.possibleCategories = [...new Set(this.possibleCategories)];
    }

    async GetExerciseFromFirebase() {
        await this.exercisesService.GetExercise(this.idToChangeExercise!).then(exercise => {
            this.exerciseName = exercise.name;
            this.categorySelected = exercise.category;
        }).catch(() => {
            this.exerciseName = "";
            this.categorySelected = undefined;
            this.idToChangeExercise = null;
        });
    }

    IsInsertingCategory() {
        this.newCategoryName = "";
        this.hideCategoryInsertion = typeof this.categorySelected != "number";
    }

    async EnterPressed() {
        if (this.exerciseName && (this.newCategoryName || typeof this.categorySelected == "string"))
            await this.OnClick();
    }

    async OnClick() {
        if (!AppInfoService.AppInfo?.isOnline) {
            await this.alertService.ShowToast("Dispositivo não esta conectado a internet", undefined, "danger");
            return;
        }
        let functionResult: Promise<any> = this.CreateOrUpdateExercise(Boolean(this.idToChangeExercise));
        await functionResult.then(async () => {
            await this.alertService.ShowToast((this.idToChangeExercise) ? "Exercício alterado com sucesso" : "Exercício criado com sucesso", undefined, "primary");
            await this.router.navigate(["/exercise-list"]);
        }).catch(async error => {
            this.isLoading = false;
            if (error.alreadyExists)
                await this.alertService.ShowToast("Exercício já existe", undefined, "warning");
            else
                await this.alertService.ShowToast((this.idToChangeExercise) ? "Não foi possível alterar o exercício" : "Não foi possível criar o exercício", undefined, "danger");
        });
    }

    async CreateOrUpdateExercise(isUpdating?: boolean) {
        this.isLoading = true;
        if (typeof this.categorySelected == "number")
            this.categorySelected = this.newCategoryName;
        let exercise = {name: this.exerciseName, category: this.categorySelected!};
        if (this.exercises.some(exer => exer.category == exercise.category && exer.name == exercise.name))
            return Promise.reject({alreadyExists: true});
        return isUpdating ? this.exercisesService.UpdateExercise(this.idToChangeExercise!, exercise) : this.exercisesService.CreateExercise(exercise);
    }
}
