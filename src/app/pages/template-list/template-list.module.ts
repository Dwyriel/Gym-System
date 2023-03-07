import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TemplateListPageRoutingModule} from './template-list-routing.module';

import {TemplateListPage} from './template-list.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TemplateListPageRoutingModule
    ],
    declarations: [TemplateListPage]
})
export class TemplateListPageModule {}
