import {Component, ElementRef, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {getRemSizeInPixels, inverseLerp, UnsubscribeIfSubscribed, waitForFirebaseResponse} from "../../services/app.utility";
import {ExerciseTemplate} from "../../interfaces/exercise";
import {ExercisesService} from "../../services/exercises.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertService} from "../../services/alert.service";
import {AppInfoService} from "../../services/app-info.service";
import {AccountService} from "../../services/account.service";

@Component({
    selector: 'app-create-exercise',
    templateUrl: './create-exercise.page.html',
    styleUrls: ['./create-exercise.page.scss'],
})
export class CreateExercisePage {
    @ViewChild('contentDiv') contentDiv?: ElementRef;

    private readonly paddingSizeInRem = 3;

    public readonly categoryCreationValue = 1;
    public exerciseName: string = "";
    public possibleCategories: Array<string> = new Array<string>();
    public categorySelected?: string | number;
    public newCategoryName: string = "";

    private appInfoSubscription?: Subscription;

    public idToChangeExercise: string | null = null;
    public hideCategoryInsertion: boolean = true;
    public isLoading: boolean = false;

    constructor(private exercisesService: ExercisesService, private router: Router, private activatedRoute: ActivatedRoute, private alertService: AlertService, private accountService: AccountService) { }

    IsInsertingCategory() {
        this.hideCategoryInsertion = typeof this.categorySelected != "number";
    }

    async ionViewWillEnter() {
        this.isLoading = true;
        this.SetCSSProperties();
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
        await this.GetUniqueCategories();
        this.idToChangeExercise = this.activatedRoute.snapshot.paramMap.get("id")
        if (this.idToChangeExercise) {
            await this.GetExerciseFromFirebase();
        }
        this.isLoading = false;
    }

    async ionViewDidLeave() {
        UnsubscribeIfSubscribed(this.appInfoSubscription);
        this.possibleCategories = new Array<string>();
        this.exerciseName = "";
        this.newCategoryName = "";
        this.isLoading = false;
        this.categorySelected = undefined;
    }

    SetCSSProperties() {
        UnsubscribeIfSubscribed(this.appInfoSubscription);
        this.appInfoSubscription = AppInfoService.GetAppInfoObservable().subscribe(appInfo => {
            this.contentDiv?.nativeElement.style.setProperty("--desktop-padding-top", appInfo?.isMobile ? "0" : ((inverseLerp(appInfo!.appWidth, appInfo!.maxMobileWidth, appInfo!.maxMobileWidth + (getRemSizeInPixels() * (this.paddingSizeInRem + this.paddingSizeInRem))) * this.paddingSizeInRem) + "rem"));
        });
    }

    async GetUniqueCategories() {
        let Exercises: Array<ExerciseTemplate> = await this.exercisesService.GetAllExercises();
        Exercises.forEach(item => this.possibleCategories.push(item.category));
        this.possibleCategories = [...new Set(this.possibleCategories)];
    }

    async GetExerciseFromFirebase(){
        let exerciseToChange = await this.exercisesService.GetExercise(this.idToChangeExercise!);
        this.exerciseName = exerciseToChange.name;
        this.categorySelected = exerciseToChange.category;
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
