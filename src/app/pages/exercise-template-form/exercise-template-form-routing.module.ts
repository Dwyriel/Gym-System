import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ExerciseTemplateFormPage} from './exercise-template-form.page';

const routes: Routes = [
    {
        path: '',
        component: ExerciseTemplateFormPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ExerciseTemplateFormPageRoutingModule {}
