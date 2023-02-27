import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PractitionerFormPageRoutingModule } from './practitioner-form-routing.module';

import { PractitionerFormPage } from './practitioner-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PractitionerFormPageRoutingModule
  ],
  declarations: [PractitionerFormPage]
})
export class PractitionerFormPageModule {}
