import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ExerciseListPage} from './exercise-list.page';

const routes: Routes = [
    {
        path: '',
        component: ExerciseListPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ExerciseListPageRoutingModule {}
