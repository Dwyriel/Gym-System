import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ExerciseTemplateFormPageRoutingModule} from './template-form-routing.module';

import {TemplateFormPage} from './template-form-page.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ExerciseTemplateFormPageRoutingModule
    ],
    declarations: [TemplateFormPage]
})
export class TemplateFormPageModule {}
