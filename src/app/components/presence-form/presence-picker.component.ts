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
    @Input("showOnlyDate") public showOnlyDate?: boolean;
    @Input("showOnlyPresence") public showOnlyPresence?: boolean;

    public static dates?: Date[];

    public wasPresent = true;
    public dateAsString?: string;
    public maxDay?: string;

    constructor(private popoverController: PopoverController) { }

    ngOnInit() {
        this.maxDay = new Date().toISOString();
        if (this.date !== undefined)
            this.dateAsString = this.date.toISOString();
        PresencePickerComponent.dates = this.datesToRestrict;
        if (this.prevPresence !== undefined)
            this.wasPresent = this.prevPresence;
        this.showOnlyDate = this.showOnlyDate !== undefined ? this.showOnlyDate : false;
        this.showOnlyPresence = this.showOnlyPresence !== undefined ? this.showOnlyPresence : false;
        if (this.showOnlyDate && this.showOnlyPresence) {
            this.showOnlyDate = false;
            this.showOnlyPresence = false;
        }
    }

    ngOnDestroy() {
        PresencePickerComponent.dates = undefined;
    }

    dismissPopover(sendData: boolean) {
        if (!sendData) {
            this.popoverController.dismiss();
            return;
        }
        this.popoverController.dismiss({
            presence: {
                date: this.dateAsString ? new Date(Date.parse(this.dateAsString!)) : undefined,
                wasPresent: !this.showOnlyDate ? this.wasPresent : undefined
            }
        });
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
