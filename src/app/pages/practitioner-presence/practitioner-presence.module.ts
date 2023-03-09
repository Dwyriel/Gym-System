import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {PractitionerPresencePageRoutingModule} from './practitioner-presence-routing.module';

import {PractitionerPresencePage} from './practitioner-presence.page';
import {ErrorComponentModule} from "../../components/error/error.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PractitionerPresencePageRoutingModule,
        ErrorComponentModule
    ],
    declarations: [PractitionerPresencePage]
})
export class PractitionerPresencePageModule {}
