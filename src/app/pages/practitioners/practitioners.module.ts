import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {PractitionersPageRoutingModule} from './practitioners-routing.module';

import {PractitionersPage} from './practitioners.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PractitionersPageRoutingModule
    ],
    declarations: [PractitionersPage]
})
export class PractitionersPageModule {}
