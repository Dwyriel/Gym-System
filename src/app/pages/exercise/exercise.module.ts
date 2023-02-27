import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {CreateExercisePageRoutingModule} from './exercise-routing.module';

import {ExercisePage} from './exercise.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        CreateExercisePageRoutingModule
    ],
    declarations: [ExercisePage]
})
export class ExercisePageModule {}
