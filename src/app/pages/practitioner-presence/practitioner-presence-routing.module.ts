import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PractitionerPresencePage } from './practitioner-presence.page';

const routes: Routes = [
  {
    path: '',
    component: PractitionerPresencePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PractitionerPresencePageRoutingModule {}
