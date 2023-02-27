import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PractitionerFormPage } from './practitioner-form.page';

const routes: Routes = [
  {
    path: '',
    component: PractitionerFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PractitionerFormPageRoutingModule {}
