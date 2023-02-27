import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ExerciseListPageRoutingModule} from './exercises-list-routing.module';

import {ExercisesListPage} from './exercises-list.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ExerciseListPageRoutingModule
    ],
    declarations: [ExercisesListPage]
})
export class ExerciseListPageModule {}
