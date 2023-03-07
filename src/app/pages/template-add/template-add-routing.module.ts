import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {TemplateAddPage} from './template-add.page';

const routes: Routes = [
    {
        path: '',
        component: TemplateAddPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TemplateAddPageRoutingModule {}
