import {Component, OnInit} from '@angular/core';
import {PopoverController} from "@ionic/angular";

@Component({
    selector: 'app-presence-picker',
    templateUrl: './presence-picker.component.html',
    styleUrls: ['./presence-picker.component.scss'],
})
export class PresencePickerComponent implements OnInit {

    public wasPresent = true;
    public dateAsString?: string;

    constructor(private popoverController: PopoverController) { }

    ngOnInit() {}

    dismissPopover(sendData: boolean) {
        if(!sendData) {
            this.popoverController.dismiss();
            return;
        }
        this.popoverController.dismiss({presence: {date: new Date(Date.parse(this.dateAsString!)), wasPresent: this.wasPresent}});
    }

    onDateChange(event: any){
        this.dateAsString = event.detail.value;
    }
}
