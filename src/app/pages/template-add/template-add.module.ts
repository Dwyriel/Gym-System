import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TemplateAddPageRoutingModule} from './template-add-routing.module';

import {TemplateAddPage} from './template-add.page';
import {ErrorComponentModule} from "../../components/error/error.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TemplateAddPageRoutingModule,
        ErrorComponentModule
    ],
    declarations: [TemplateAddPage]
})
export class TemplateAddPageModule {}
