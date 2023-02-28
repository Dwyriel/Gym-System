import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ExerciseFormPageRoutingModule} from './exercise-form-routing.module';

import {ExerciseFormPage} from './exercise-form.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ExerciseFormPageRoutingModule
    ],
    declarations: [ExerciseFormPage]
})
export class ExerciseFormPageModule {}
