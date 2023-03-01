import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {PractitionerExercisePage} from './practitioner-exercise.page';

const routes: Routes = [
    {
        path: '',
        component: PractitionerExercisePage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PractitionerExercisePageRoutingModule {}
