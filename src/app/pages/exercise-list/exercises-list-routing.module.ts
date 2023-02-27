import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ExercisesListPage} from './exercises-list.page';

const routes: Routes = [
    {
        path: '',
        component: ExercisesListPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ExerciseListPageRoutingModule {}
