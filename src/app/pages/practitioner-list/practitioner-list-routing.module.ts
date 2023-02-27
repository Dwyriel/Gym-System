import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {PractitionerListPage} from './practitioner-list.page';

const routes: Routes = [
    {
        path: '',
        component: PractitionerListPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PractitionerPageRoutingModule {}
