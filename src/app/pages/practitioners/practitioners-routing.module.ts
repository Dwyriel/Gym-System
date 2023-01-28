import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {PractitionersPage} from './practitioners.page';

const routes: Routes = [
    {
        path: '',
        component: PractitionersPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PractitionersPageRoutingModule {}
