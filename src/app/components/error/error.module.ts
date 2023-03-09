import {NgModule} from "@angular/core";
import {ErrorComponent} from "./error.component";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {IonicModule} from "@ionic/angular";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
    ],
    declarations: [
        ErrorComponent,
    ],
    exports: [
        ErrorComponent,
    ]
})
export class ErrorComponentModule {}
