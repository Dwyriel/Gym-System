import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {PractitionerPageRoutingModule} from './practitioner-list-routing.module';

import {PractitionerListPage} from './practitioner-list.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PractitionerPageRoutingModule
    ],
    declarations: [PractitionerListPage]
})
export class PractitionerListPageModule {}
