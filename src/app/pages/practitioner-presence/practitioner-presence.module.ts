import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PractitionerPresencePageRoutingModule } from './practitioner-presence-routing.module';

import { PractitionerPresencePage } from './practitioner-presence.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PractitionerPresencePageRoutingModule
  ],
  declarations: [PractitionerPresencePage]
})
export class PractitionerPresencePageModule {}
