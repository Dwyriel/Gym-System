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
    private readonly minSkeletonTextSize = 50;
    private readonly skeletonTextVariation = 20;
    private readonly skeletonTextNumOfItems = 10;
    private practitioner: Practitioner = new Practitioner();
    private presenceLog: Presence[] = [];

    public readonly minWidthForFullText = 400;
    public skeletonTextItems: { styleDay: string, stylePresent: string }[] = [];
    public practitionerID: string | null = null;
    public monthFilter?: string;
    public yearFilter?: string;
    public availableYears: string[] = [];
    public availableMonthsInYear: string[] = [];
    public filteredPresenceLogByYear: Presence[] = [];
    public filteredPresenceLog: Presence[] = [];
    public isLoading: boolean = true;
    public errorOccurred: boolean = false;
    public appInfo = AppInfoService.AppInfo;

    constructor(private router: Router, private activatedRoute: ActivatedRoute, private accountService: AccountService, private practitionerService: PractitionerService, private popoverController: PopoverController, private alertService: AlertService) { }

    async ionViewWillEnter() {
        this.setSkeletonText();
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");
        await this.getPractitioner();
        if(!this.errorOccurred) {
            let cacheError = false;
            await this.getPresences(true).catch(() => cacheError = true);
            if (cacheError)
                await this.getPresences().catch(() => this.errorOccurred = true);
        }
        if (this.errorOccurred) {
            await this.alertService.ShowToast("Um erro ocorreu ao receber dados, atualize a pagina", undefined, "danger");
            this.isLoading = false;
            return;
        }
        this.getPossibleYearsToFilter();
        this.isLoading = false;
    }

    ionViewWillLeave() {
        this.isLoading = true;
        this.errorOccurred = false;
        this.practitionerID = null;
        this.monthFilter = undefined;
        this.yearFilter = undefined;
        this.availableYears = [];
        this.availableMonthsInYear = [];
        this.filteredPresenceLogByYear = [];
        this.filteredPresenceLog = [];
        this.presenceLog = [];
        this.practitioner = new Practitioner();
    }

    setSkeletonText() {
        this.skeletonTextItems = [];
        for (let i = 0; i < this.skeletonTextNumOfItems; i++)
            this.skeletonTextItems.push({
                styleDay: `width: ${((Math.random() * this.skeletonTextVariation) + this.minSkeletonTextSize)}px; height: 16px;`,
                stylePresent: `width: ${Math.random() < .5 ? 50 : 35}px`
            });
    }

    async getPractitioner() {
        let cacheError = false;
        await this.practitionerService.GetPractitionerFromCache(this.practitionerID!).then(result => this.practitioner = result).catch(async () => cacheError = true);
        if (cacheError)
            await this.practitionerService.GetPractitioner(this.practitionerID!).then(result => this.practitioner = result).catch(() => this.errorOccurred = true);
    }

    private async getPresences(fromCache: boolean = false) {
        return this.practitionerService.GetPractitionersPresences(this.practitioner.presenceLogID, fromCache).then(returnedValue => {
            this.presenceLog = returnedValue.sort((firstElement, secondElement) => secondElement.date.getTime() - firstElement.date.getTime());
        });
    }

    private getPossibleYearsToFilter() {
        let years: string[] = [];
        for (let presence of this.presenceLog)
            if (!years.includes(presence.date.getFullYear().toString()))
                years.push(presence.date.getFullYear().toString());
        this.availableYears = years;
        if (years.length > 0)
            this.yearFilter = years[0];
        this.yearFilterChanged();
    }

    private getPossibleMonthsToFilterInYear(presencesInYear: Presence[]) {
        let monthsInYear: string[] = [];
        for (let presenceInYear of presencesInYear) {
            let monthNotPresent = true;
            for (let month of monthsInYear)
                if (month == presenceInYear.date.getMonth().toString()) {
                    monthNotPresent = false;
                    break;
                }
            if (monthNotPresent)
                monthsInYear.push(presenceInYear.date.getMonth().toString());
        }
        this.availableMonthsInYear = monthsInYear;
        if (monthsInYear.length > 0)
            this.monthFilter = monthsInYear[0];
    }

    /* --- UI related events --- */
    public yearFilterChanged() {
        this.filteredPresenceLogByYear = [];
        for (let presence of this.presenceLog)
            if (presence.date.getFullYear() == Number(this.yearFilter))
                this.filteredPresenceLogByYear.push(presence);
        this.getPossibleMonthsToFilterInYear(this.filteredPresenceLogByYear);
        this.monthFilterChanged();
    }

    public monthFilterChanged() {
        this.filteredPresenceLog = [];
        for (let presence of this.filteredPresenceLogByYear)
            if (presence.date.getMonth() == Number(this.monthFilter))
                this.filteredPresenceLog.push(presence);
    }

    public async onPresenceClick(presence: Presence) {
        const selection = await this.alertService.ConfirmationAlertThreeButtons("Editar ou excluir?", undefined, "Editar", "Excluir", "Cancelar");
        switch (selection) {
            case 0:
                return;
            case 1:
                await this.deletePresenceBtn(presence);
                break;
            case 2:
                await this.editPresenceBtn(presence);
                break;
        }
    }

    private async deletePresenceBtn(presence: Presence) {
        let confirmation = await this.alertService.ConfirmationAlert("Deseja remover esta presença?", undefined, "Não", "Sim");
        if (!confirmation)
            return;
        let id = await this.alertService.PresentLoading("Carregando");
        await this.practitionerService.RemovePresence(this.practitioner.presenceLogID, presence)
            .then(async () => await this.alertService.ShowToast("Marcação removida com sucesso", undefined, "primary"))
            .catch(async () => await this.alertService.ShowToast("Não foi possível remover a marcação da data", undefined, "danger"));
        await this.refreshListAfterChange();
        await this.alertService.DismissLoading(id);

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
            if (value.data.presence.wasPresent == presence.wasPresent) {
                await this.alertService.ShowToast("Nada foi alterado", undefined, "warning");
                return;
            }
            if (value.data) {
                let id = await this.alertService.PresentLoading("Carregando");
                let editedPresence: Presence = {date: presence.date, wasPresent: value.data.presence.wasPresent};
                let errorOcurred = false;
                await this.practitionerService.AddPresence(this.practitioner.presenceLogID, editedPresence).catch(() => errorOcurred = true);
                if (!errorOcurred)
                    await this.practitionerService.RemovePresence(this.practitioner.presenceLogID, presence).catch(() => errorOcurred = true);
                if (errorOcurred)
                    await this.alertService.ShowToast("Não foi possível editar a marcação da data", undefined, "danger");
                else {
                    await this.alertService.ShowToast("Marcação alterada com sucesso", undefined, "primary");
                    await this.refreshListAfterChange();
                }
                await this.alertService.DismissLoading(id);
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
                let id = await this.alertService.PresentLoading("Carregando");
                await this.practitionerService.AddPresence(this.practitioner.presenceLogID, value.data.presence)
                    .then(async () => await this.alertService.ShowToast("Marcação criada com sucesso", undefined, "primary"))
                    .catch(async () => await this.alertService.ShowToast("Não foi possível criar a marcação da data", undefined, "danger"));
                await this.refreshListAfterChange();
                await this.alertService.DismissLoading(id);
            }
        });
        await createPresencePopover.present();
    }

    private restrictedCalendarDates() {
        let datesToRestrict: Date[] = [];
        for (let presence of this.presenceLog) datesToRestrict.push(presence.date);
        return datesToRestrict;
    }

    private async refreshListAfterChange() {
        let errorOccurred = false;
        await this.getPresences().catch(() => errorOccurred = true);
        if (errorOccurred) {
            await this.alertService.ShowToast("Um erro ocorreu ao receber dados, atualize a pagina", undefined, "danger");
            return;
        }
        this.getPossibleYearsToFilter();
    }

    public getDayOfWeekName(num: number): string {
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

    public getMonthName(num: string): string {
        switch (Number(num)) {
            case 0:
                return "Janeiro";
            case 1:
                return "Fevereiro";
            case 2:
                return "Março";
            case 3:
                return "Abril";
            case 4:
                return "Maio";
            case 5:
                return "Junho";
            case 6:
                return "Julho";
            case 7:
                return "Agosto";
            case 8:
                return "Setembro";
            case 9:
                return "Outubro";
            case 10:
                return "Novembro";
            case 11:
                return "Dezembro";
            default:
                return "";
        }
    }
}
