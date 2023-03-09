import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {PractitionerProfilePageRoutingModule} from './practitioner-profile-routing.module';

import {PractitionerProfilePage} from './practitioner-profile.page';
import {ErrorComponentModule} from "../../components/error/error.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PractitionerProfilePageRoutingModule,
        ErrorComponentModule
    ],
    declarations: [PractitionerProfilePage]
})
export class PractitionerProfilePageModule {}
