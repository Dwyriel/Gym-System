import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {PractitionerProfilePage} from './practitioner-profile.page';

const routes: Routes = [
    {
        path: '',
        component: PractitionerProfilePage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PractitionerProfilePageRoutingModule {}
