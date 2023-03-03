import {Component, Input, OnInit} from '@angular/core';
import {PopoverController} from "@ionic/angular";

@Component({
    selector: 'app-presence-picker',
    templateUrl: './presence-picker.component.html',
    styleUrls: ['./presence-picker.component.scss'],
})
export class PresencePickerComponent implements OnInit {

    @Input("date") public date?: Date;
    @Input("datesToRestrict") public datesToRestrict?: Date[];
    @Input("wasPresent") public prevPresence?: boolean;

    public static dates?: Date[];

    public wasPresent = true;
    public dateAsString?: string;
    public maxDay?: string;

    constructor(private popoverController: PopoverController) { }

    ngOnInit() {
        this.maxDay = new Date().toISOString();
        if (this.prevPresence !== undefined)
            this.wasPresent = this.prevPresence;
        if (this.date !== undefined)
            this.dateAsString = this.date.toISOString();
        PresencePickerComponent.dates = this.datesToRestrict;
    }

    ngOnDestroy() {
        PresencePickerComponent.dates = undefined;
    }

    dismissPopover(sendData: boolean) {
        if (!sendData) {
            this.popoverController.dismiss();
            return;
        }
        this.popoverController.dismiss({presence: {date: new Date(Date.parse(this.dateAsString!)), wasPresent: this.wasPresent}});
    }

    onDateChange(event: any) {
        this.dateAsString = event.detail.value;
    }

    disableSpecificDays(dateString: string) {
        const date = new Date(dateString);
        const dateStr = date.toISOString().split('T')[0];
        if (!PresencePickerComponent.dates)
            return true;
        for (let restrictDate of PresencePickerComponent.dates)
            if (dateStr === restrictDate.toISOString().split('T')[0])
                return false;
        return true;
    }
}
