import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreatePractitionerPage } from './create-practitioner.page';

const routes: Routes = [
  {
    path: '',
    component: CreatePractitionerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreatePractitionerPageRoutingModule {}
