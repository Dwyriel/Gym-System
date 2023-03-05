import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {FormsModule} from "@angular/forms";
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {provideAuth, getAuth} from '@angular/fire/auth';
import {provideFirestore, getFirestore, enableIndexedDbPersistence} from '@angular/fire/firestore';
import {provideStorage, getStorage} from '@angular/fire/storage';
import {environment} from '../environments/environment';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {SelectExerciseAndWorkloadComponent} from "./components/select-exercise-and-workload/select-exercise-and-workload.component";
import {PresencePickerComponent} from "./components/presence-form/presence-picker.component";

@NgModule({
    declarations: [AppComponent, SelectExerciseAndWorkloadComponent, PresencePickerComponent],
    imports: [BrowserModule, FormsModule, IonicModule.forRoot(), AppRoutingModule, provideFirebaseApp(() => initializeApp(environment.firebase)), provideAuth(() => getAuth()), provideFirestore(() => {
        const firestore = getFirestore();
        enableIndexedDbPersistence(firestore);
        return firestore;
    }), provideStorage(() => getStorage())],
    providers: [{provide: RouteReuseStrategy, useClass: IonicRouteStrategy}],
    bootstrap: [AppComponent],
})
export class AppModule {}
