import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ExerciseFormPage} from './exercise-form.page';

const routes: Routes = [
    {
        path: '',
        component: ExerciseFormPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ExerciseFormPageRoutingModule {}
