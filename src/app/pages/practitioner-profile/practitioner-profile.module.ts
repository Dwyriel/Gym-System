import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {PractitionerProfilePageRoutingModule} from './practitioner-profile-routing.module';

import {PractitionerProfilePage} from './practitioner-profile.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PractitionerProfilePageRoutingModule
    ],
    declarations: [PractitionerProfilePage]
})
export class PractitionerProfilePageModule {}
