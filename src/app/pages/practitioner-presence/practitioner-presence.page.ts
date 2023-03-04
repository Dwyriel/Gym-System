import {Component} from '@angular/core';
import {waitForFirebaseResponse} from "../../services/app.utility";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService} from "../../services/account.service";
import {PractitionerService} from "../../services/practitioner.service";
import {Practitioner} from "../../classes/practitioner";
import {Presence} from "../../interfaces/frequency-log";
import {PopoverController} from "@ionic/angular";
import {PresencePickerComponent} from "../../components/presence-form/presence-picker.component";
import {AlertService} from "../../services/alert.service";
import {AppInfoService} from "../../services/app-info.service";

@Component({
    selector: 'app-practitioner-presence',
    templateUrl: './practitioner-presence.page.html',
    styleUrls: ['./practitioner-presence.page.scss'],
})
export class PractitionerPresencePage {
    private practitioner: Practitioner = new Practitioner();

    public practitionerID: string | null = null;
    public appInfo = AppInfoService.AppInfo
    public monthFilter?: string;
    public yearFilter?: string;
    public availableYearsToFilter: string[] = [];
    public presenceLog: Presence[] = [];
    public filteredPresenceLog: Presence[] = [];

    constructor(private router: Router, private activatedRoute: ActivatedRoute, private accountService: AccountService, private practitionerService: PractitionerService,  private popoverController: PopoverController, private alertService: AlertService) { }

    async ionViewWillEnter() {
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");
        if (!(await this.getPractitioner()))
            return;
        await this.getPresences(true);
        this.getPossibleYearsToFilters();
        this.startFilters();
        this.filterPresenceLog();
    }

    async getPractitioner() {
        let cacheError = false, errorOccurred = false;
        await this.practitionerService.GetPractitionerFromCache(this.practitionerID!).then(result => this.practitioner = result).catch(async () => cacheError = true);
        if (cacheError)
            await this.practitionerService.GetPractitioner(this.practitionerID!).then(result => this.practitioner = result).catch(() => errorOccurred = true);
        return !errorOccurred;
    }

    public async OnClick(presence?: Presence) {
        if (!presence)
            return;
        const selection = await this.alertService.ConfirmationAlertThreeButtons("Editar ou excluir?", undefined, "Editar", "Excluir", "Cancelar");
        if (selection == 0)
            return;
        else if (selection == 1)
            await this.deletePresenceBtn(presence);
        else if (selection == 2)
            await this.editPresenceBtn(presence);
    }

    private async deletePresenceBtn(presence: Presence) {
        let confirmation = await this.alertService.ConfirmationAlert("Deseja remover esta presença?", undefined, "Não", "Sim");
        if (!confirmation)
            return;
        await this.practitionerService.RemovePresence(this.practitioner.presenceLogID, presence)
            .catch(async () => await this.alertService.ShowToast("Não foi possível remover a marcação da data", undefined, "danger"));
        await this.refreshListAfterChange();
    }

    async editPresenceBtn(presence: Presence) {
        let datesToRestrict = this.restrictedCalendarDates();
        const editPresencePopover = await this.popoverController.create({
            component: PresencePickerComponent,
            mode: 'md',
            componentProps: {
                showOnlyPresence: true,
                wasPresent: presence.wasPresent,
                datesToRestrict: datesToRestrict
            },
            animated: true
        });
        editPresencePopover.onDidDismiss().then(async value => {
            if (value.data) {
                let editedPresence: Presence = {date: presence.date, wasPresent: value.data.presence.wasPresent};
                let errorOcurred = false;
                await this.practitionerService.AddPresence(this.practitioner.presenceLogID, editedPresence).catch(() => errorOcurred = true);
                await this.practitionerService.RemovePresence(this.practitioner.presenceLogID, presence).catch(() => errorOcurred = true);
                if (errorOcurred)
                    await this.alertService.ShowToast("Não foi possível editar a marcação da data", undefined, "danger");
                await this.refreshListAfterChange();
            }
        });
        await editPresencePopover.present();
    }

    public async createPresenceBtn() {
        let datesToRestrict = this.restrictedCalendarDates();
        const createPresencePopover = await this.popoverController.create({
            component: PresencePickerComponent,
            mode: 'md',
            componentProps: {
                wasPresent: true,
                datesToRestrict: datesToRestrict
            },
            animated: true
        });
        createPresencePopover.onDidDismiss().then(async value => {
            if (value.data) {
                await this.practitionerService.AddPresence(this.practitioner.presenceLogID, value.data.presence)
                    .catch(async () => await this.alertService.ShowToast("Não foi possível criar a marcação da data", undefined, "danger"));
                await this.refreshListAfterChange();
            }
        });
        await createPresencePopover.present();
    }

    public filterPresenceLog() {
        this.filteredPresenceLog = [];
        let monthFilteredLogs: Presence[] = [];
        this.presenceLog.forEach(presence => {
            if (presence.date.getMonth() == Number(this.monthFilter))
                monthFilteredLogs.push(presence);
        });
        monthFilteredLogs.forEach(presence => {
            if (presence.date.getFullYear() == Number(this.yearFilter))
                this.filteredPresenceLog.push(presence);
        });
    }

    private async getPresences(fromCache: boolean = false){
        await this.practitionerService.GetPractitionersPresences(this.practitioner.presenceLogID, fromCache).then(returnedValue => {
            this.presenceLog = returnedValue.sort((firstElement, secondElement) => secondElement.date.getTime() - firstElement.date.getTime());
        });//TODO: catch
    }

    private restrictedCalendarDates() {
        let datesToRestrict: Date[] = [];
        this.presenceLog.forEach(presence => datesToRestrict.push(presence.date));
        return datesToRestrict;
    }

    private async refreshListAfterChange() {
        await this.getPresences();
        this.getPossibleYearsToFilters();
        this.filterPresenceLog();
    }

    private getPossibleYearsToFilters() {
        let years: string[] = [];
        this.presenceLog.forEach(presence => {
            if (!years.includes(presence.date.getFullYear().toString()))
                years.push(presence.date.getFullYear().toString());
        });
        this.availableYearsToFilter = years;
    }

    private startFilters() {
        const todayDate = new Date;
        this.monthFilter = (todayDate.getMonth()).toString();
        this.yearFilter = (todayDate.getFullYear()).toString();
    }

    public getDayOfWeek(num: number): string {
        switch (num) {
            case 0:
                return "Dom";
            case 1:
                return "Seg";
            case 2:
                return "Ter";
            case 3:
                return "Qua";
            case 4:
                return "Qui";
            case 5:
                return "Sex";
            case 6:
                return "Sáb";
            default:
                return "";
        }
    }
}
