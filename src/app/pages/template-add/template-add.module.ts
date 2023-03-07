import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TemplateAddPageRoutingModule} from './template-add-routing.module';

import {TemplateAddPage} from './template-add.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TemplateAddPageRoutingModule
    ],
    declarations: [TemplateAddPage]
})
export class TemplateAddPageModule {}
