import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {PractitionerExercisePageRoutingModule} from './practitioner-exercise-routing.module';

import {PractitionerExercisePage} from './practitioner-exercise.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PractitionerExercisePageRoutingModule
    ],
    declarations: [PractitionerExercisePage]
})
export class PractitionerExercisePageModule {}
