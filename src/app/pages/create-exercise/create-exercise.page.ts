import {Component} from '@angular/core';
import {waitForFirebaseResponse} from "../../services/app.utility";
import {ExerciseTemplate} from "../../interfaces/exercise";
import {ExercisesService} from "../../services/exercises.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertService} from "../../services/alert.service";
import {AccountService} from "../../services/account.service";

@Component({
    selector: 'app-create-exercise',
    templateUrl: './create-exercise.page.html',
    styleUrls: ['./create-exercise.page.scss'],
})
export class CreateExercisePage {
    public readonly categoryCreationValue = 1;
    public exerciseName: string = "";
    public categorySelected?: string | number;
    public possibleCategories: Array<string> = new Array<string>();
    public newCategoryName: string = "";

    public idToChangeExercise: string | null = null;
    public hideCategoryInsertion: boolean = true;
    public isLoading: boolean = false;

    constructor(private exercisesService: ExercisesService, private router: Router, private activatedRoute: ActivatedRoute, private alertService: AlertService, private accountService: AccountService) { }

    IsInsertingCategory() {
        this.newCategoryName = "";
        this.hideCategoryInsertion = typeof this.categorySelected != "number";
    }

    async ionViewWillEnter() {
        this.isLoading = true;
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
        await this.GetUniqueCategories();
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

    async GetUniqueCategories() {
        let Exercises: Array<ExerciseTemplate> = await this.exercisesService.GetAllExercises();
        Exercises.forEach(item => this.possibleCategories.push(item.category));
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

    async EnterPressed() {
        if (this.exerciseName && (this.newCategoryName || typeof this.categorySelected == "string"))
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
