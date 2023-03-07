import {Component} from '@angular/core';
import {PractitionerService} from "../../services/practitioner.service";
import {ExercisesService} from "../../services/exercises.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
})
export class HomePage {
    public numberOfPractitioners?: number;
    public numberOfExercises?: number;
    public numberOfTemplates?: number;
    public isLoading = false;

    constructor(private practitionerService: PractitionerService, private exercisesService: ExercisesService) { }

    async ionViewWillEnter() {
        this.isLoading = true;
        this.numberOfPractitioners = await this.practitionerService.GetPractitionerCount();
        this.numberOfExercises = await this.exercisesService.GetExerciseCount();
        this.numberOfTemplates = await this.exercisesService.GetExerciseTemplateCount();
        this.isLoading = false;
    }
}
