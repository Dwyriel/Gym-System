import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ExerciseTemplateFormPageRoutingModule} from './exercise-template-form-routing.module';

import {ExerciseTemplateFormPage} from './exercise-template-form.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ExerciseTemplateFormPageRoutingModule
    ],
    declarations: [ExerciseTemplateFormPage]
})
export class ExerciseTemplateFormPageModule {}
