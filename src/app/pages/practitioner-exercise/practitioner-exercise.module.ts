import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {PractitionerExercisePageRoutingModule} from './practitioner-exercise-routing.module';

import {PractitionerExercisePage} from './practitioner-exercise.page';
import {ErrorComponentModule} from "../../components/error/error.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PractitionerExercisePageRoutingModule,
        ErrorComponentModule
    ],
    declarations: [PractitionerExercisePage]
})
export class PractitionerExercisePageModule {}
