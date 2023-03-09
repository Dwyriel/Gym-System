import {NgModule} from "@angular/core";
import {ErrorComponent} from "./error.component";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {IonicModule} from "@ionic/angular";
import {RouterModule} from "@angular/router";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule
    ],
    declarations: [
        ErrorComponent,
    ],
    exports: [
        ErrorComponent,
    ]
})
export class ErrorComponentModule {}
