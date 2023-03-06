import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {TemplateListPage} from './template-list.page';

const routes: Routes = [
    {
        path: '',
        component: TemplateListPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TemplateListPageRoutingModule {}
