import {Component} from '@angular/core';
import {waitForFirebaseResponse} from "../../services/app.utility";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService} from "../../services/account.service";
import {PractitionerService} from "../../services/practitioner.service";
import {AlertService} from "../../services/alert.service";
import {Practitioner} from "../../classes/practitioner";
import {PractitionerExercise, Exercise} from "../../interfaces/exercise";
import {ExercisesService} from "../../services/exercises.service";
import {PopoverController} from "@ionic/angular";
import {SelectExerciseAndWorkloadComponent} from "../../components/select-exercise-and-workload/select-exercise-and-workload.component";
import {AppInfoService} from "../../services/app-info.service";

function sortExerciseByCategory(firstExerc: Exercise, secondExerc: Exercise) {
    let firstLowerCase = firstExerc.category.toLowerCase();
    let secondLowerCase = secondExerc.category.toLowerCase();
    return (firstLowerCase < secondLowerCase) ? -1 : (firstLowerCase > secondLowerCase) ? 1 : 0;
}

function sortPracExerciseByCategory(firstExerc: PractitionerExercise, secondExerc: PractitionerExercise) {
    let firstLowerCase = firstExerc.exercise!.category.toLowerCase();
    let secondLowerCase = secondExerc.exercise!.category.toLowerCase();
    return (firstLowerCase < secondLowerCase) ? -1 : (firstLowerCase > secondLowerCase) ? 1 : 0;
}

function sortPracExerciseByName(firstExerc: PractitionerExercise, secondExerc: PractitionerExercise) {
    let firstLowerCase = firstExerc.exercise!.name.toLowerCase();
    let secondLowerCase = secondExerc.exercise!.name.toLowerCase();
    return (firstLowerCase < secondLowerCase) ? -1 : (firstLowerCase > secondLowerCase) ? 1 : 0;
}

@Component({
    selector: 'app-practitioner-exercise',
    templateUrl: './practitioner-exercise.page.html',
    styleUrls: ['./practitioner-exercise.page.scss'],
})
export class PractitionerExercisePage {
    private readonly minSkeletonTextSize = 100;
    private readonly skeletonTextVariation = 250;
    private readonly skeletonTextNumOfItems = 8;

    public readonly minWidthForFullText = 700;

    public skeletonTextItems: string[] = [];
    public practitionerInfo?: Practitioner;
    public practitionerExercises?: PractitionerExercise[];
    public exercisesByCategory: { name: string, practitionerExercises: PractitionerExercise[] }[] = [];
    public allExercises?: Exercise[];
    public isLoading = false;
    public errorOccurred = false;
    public practitionerID: string | null = null;
    public appInfo = AppInfoService.AppInfo;

    constructor(private router: Router, private activatedRoute: ActivatedRoute, private accountService: AccountService, private practitionerService: PractitionerService, private exercisesService: ExercisesService, private popoverController: PopoverController, private alertService: AlertService) { }

    async ionViewWillEnter() {
        this.setSkeletonText();
        this.isLoading = true;
        this.errorOccurred = false;
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");
        let cacheError = false;
        await this.practitionerService.GetPractitionerFromCache(this.practitionerID!).then(result => this.practitionerInfo = result).catch(() => cacheError = true);
        if (cacheError)
            await this.practitionerService.GetPractitioner(this.practitionerID!).then(result => this.practitionerInfo = result).catch(() => this.errorOccurred = true);
        if (this.errorOccurred) {
            await this.alertService.ShowToast("Ocorreu um erro carregando as informações", undefined, "danger");
            return;
        }
        this.allExercises = await this.exercisesService.GetAllExercises();
        this.allExercises.sort(sortExerciseByCategory);
        await this.populateExerciseList();
        this.isLoading = false;
    }

    ionViewDidLeave() {
        this.isLoading = false;
        this.errorOccurred = false;
        this.practitionerInfo = undefined;
        this.practitionerExercises = undefined;
        this.allExercises = undefined;
        this.practitionerID = null;
    }

    get hasExercises() {
        return this.practitionerExercises !== undefined && this.practitionerExercises.length > 0;
    }

    setSkeletonText() {
        this.skeletonTextItems = [];
        for (let i = 0; i < this.skeletonTextNumOfItems; i++)
            this.skeletonTextItems.push(`width: ${((Math.random() * this.skeletonTextVariation) + this.minSkeletonTextSize)}px; max-width: 80%`);
    }

    private async populateExerciseList() {
        this.practitionerExercises = await this.practitionerService.GetPractitionersExercises(this.practitionerInfo!.exercisesID);
        this.practitionerExercises.sort(sortPracExerciseByCategory);
        this.exercisesByCategory = [];
        for (let practitionerExercise of this.practitionerExercises) {
            if (!this.exercisesByCategory.some(category => category.name === practitionerExercise.exercise!.category)) {
                this.exercisesByCategory.push({name: practitionerExercise.exercise!.category, practitionerExercises: [practitionerExercise]});
                continue;
            }
            for (let index = 0; index < this.exercisesByCategory.length; index++) {
                if (this.exercisesByCategory[index].name === practitionerExercise.exercise!.category) {
                    this.exercisesByCategory[index].practitionerExercises.push(practitionerExercise);
                    this.exercisesByCategory[index].practitionerExercises.sort(sortPracExerciseByName);
                    break;
                }
            }
        }
        console.log(this.exercisesByCategory);
    }

    public async onClick(exercise?: PractitionerExercise) {
        if (!exercise) {
            await this.addExerciseBtn();
            return;
        }
        const selection = await this.alertService.ConfirmationAlertThreeButtons("Editar ou excluir?", undefined, "Editar", "Excluir", "Cancelar");
        if (selection == 0)
            return;
        else if (selection == 2)
            await this.editExerciseBtn(exercise);
        else if (selection == 1)
            await this.removeExerciseBtn(exercise);
    }

    public async removeAllExercises() {
        let confirmation = await this.alertService.ConfirmationAlert("Deseja remover todos os exercícios?", `O aluno "${this.practitionerInfo?.name}" ficará sem exercícios.`, "Não", "Sim");
        if (!confirmation || !this.practitionerInfo?.exercisesID)
            return;
        let id = await this.alertService.PresentLoading("Carregando");
        await this.practitionerService.ClearExercises(this.practitionerInfo?.exercisesID)
            .then(async () => {
                await this.alertService.ShowToast("Exercícios removidos com sucesso", undefined, "primary")
                await this.populateExerciseList();
            })
            .catch(async () => await this.alertService.ShowToast("Não foi possível remover os exercícios", undefined, "danger"));
        await this.updateUserOutOfTemplate();
        await this.alertService.DismissLoading(id);
    }

    private async addExerciseBtn() {
        const unusedExercises = this.removeRepeatedExercises();
        const addExercisePopover = await this.popoverController.create({
            component: SelectExerciseAndWorkloadComponent,
            mode: 'md',
            componentProps: {exercisesInput: unusedExercises},
            animated: true
        });
        addExercisePopover.onDidDismiss().then(async value => {
            if (value.data) {
                let id = await this.alertService.PresentLoading("Carregando");
                await this.practitionerService.AddExercise(this.practitionerInfo!.exercisesID, value.data.selectedExercise)
                    .then(async () => await this.alertService.ShowToast("Exercício adicionado com sucesso", undefined, "primary"))
                    .catch(async () => await this.alertService.ShowToast("Não foi possível adicionar o exercício", undefined, "danger"));
                await this.populateExerciseList();
                await this.updateUserOutOfTemplate();
                await this.alertService.DismissLoading(id);
            }
        });
        await addExercisePopover.present();
    }

    private async editExerciseBtn(oldExercise: PractitionerExercise) {
        const editExercisePopover = await this.popoverController.create({
            component: SelectExerciseAndWorkloadComponent,
            mode: 'md',
            componentProps: {workloadInput: {series: oldExercise.series, repetition: oldExercise.repetition, rest: oldExercise.rest, load: oldExercise.load}},
            animated: true
        });
        editExercisePopover.onDidDismiss().then(async value => {
            if (value.data) {
                let newExercise: PractitionerExercise = {
                    exerciseID: oldExercise.exerciseID,
                    exercise: oldExercise.exercise,
                    series: value.data.updatedWorkload!.series,
                    repetition: value.data.updatedWorkload!.repetition,
                    rest: value.data.updatedWorkload!.rest,
                    load: value.data.updatedWorkload!.load
                };
                let id = await this.alertService.PresentLoading("Carregando");
                await this.updateEditedExercise(oldExercise, newExercise);
                await this.alertService.DismissLoading(id);

            }
        });
        await editExercisePopover.present();
    }

    async updateEditedExercise(oldExercise: PractitionerExercise, newExercise: PractitionerExercise) {
        let errorOccurred = false;
        if (oldExercise.series == newExercise.series && oldExercise.repetition == newExercise.repetition && oldExercise.rest == newExercise.rest && oldExercise.load == newExercise.load) {
            await this.alertService.ShowToast("Nada foi alterado", undefined, "warning");
            return;
        }
        await this.practitionerService.RemoveExercise(this.practitionerInfo!.exercisesID, oldExercise).catch(() => errorOccurred = true);
        if (!errorOccurred)
            await this.practitionerService.AddExercise(this.practitionerInfo!.exercisesID, newExercise).catch(() => errorOccurred = true);
        if (errorOccurred)
            await this.alertService.ShowToast("Não foi possível altearar o exercício", undefined, "danger");
        else {
            await this.alertService.ShowToast("Exercício alterado com sucesso", undefined, "primary");
            await this.populateExerciseList();
        }
    }

    public async removeExerciseBtn(exercise: PractitionerExercise) {
        let confirmation = await this.alertService.ConfirmationAlert("Deseja remover este exercício?", undefined, "Não", "Sim");
        if (!this.practitionerInfo?.exercisesID || !confirmation)
            return;
        let id = await this.alertService.PresentLoading("Carregando");
        await this.practitionerService.RemoveExercise(this.practitionerInfo?.exercisesID, exercise)
            .then(async () => await this.alertService.ShowToast("Exercício removido com sucesso", undefined, "primary"))
            .catch(async () => await this.alertService.ShowToast("Não foi possível remover o exercício", undefined, "danger"));
        await this.populateExerciseList();
        await this.updateUserOutOfTemplate();
        await this.alertService.DismissLoading(id);

    }

    private removeRepeatedExercises() {
        let newList: Exercise[] = [];
        for (let exer of this.allExercises!) {
            let canAdd = true;
            for (let pracExer of this.practitionerExercises!)
                if (exer.thisObjectID == pracExer.exercise?.thisObjectID)
                    canAdd = false;
            if (canAdd)
                newList.push(exer);
        }
        return newList;
    }

    private async updateUserOutOfTemplate() {
        if (!this.practitionerInfo?.templateName || !this.practitionerID)
            return;
        await this.practitionerService.UpdatePractitioner(this.practitionerID, {templateName: ""})
    }
}
