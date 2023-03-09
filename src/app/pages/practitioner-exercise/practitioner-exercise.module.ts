import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {PractitionerExercisePageRoutingModule} from './practitioner-exercise-routing.module';

import {PractitionerExercisePage} from './practitioner-exercise.page';
import {ErrorComponent} from "../../components/error/error.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PractitionerExercisePageRoutingModule
    ],
    declarations: [PractitionerExercisePage, ErrorComponent]
})
export class PractitionerExercisePageModule {}
