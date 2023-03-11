import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Practitioner} from "../../classes/practitioner";
import {PractitionerService} from "../../services/practitioner.service";
import {AlertService} from "../../services/alert.service";
import {AccountService} from "../../services/account.service";
import {waitForFirebaseResponse} from "../../services/app.utility";

@Component({
    selector: 'app-practitioner-profile',
    templateUrl: './practitioner-profile.page.html',
    styleUrls: ['./practitioner-profile.page.scss'],
})
export class PractitionerProfilePage {
    public practitionerInfo?: Practitioner;
    public isLoading: boolean = false;
    public errorOccurred: boolean = false;
    public practitionerID: string | null = null;
    public todayPresenceValue?: string;

    constructor(private router: Router, private activatedRoute: ActivatedRoute, private accountService: AccountService, private practitionerService: PractitionerService, private alertService: AlertService) { }

    async ionViewWillEnter() {
        this.isLoading = true;
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");
        await this.practitionerService.GetPractitioner(this.practitionerID!)
            .then(result => this.practitionerInfo = result).catch(async () => this.errorOccurred = true);
        if (!this.errorOccurred)
            await this.practitionerService.GetPractitionersPresences(this.practitionerInfo!.presenceLogID)
                .then(result => {
                    this.practitionerInfo!.presenceLog = result;
                    this.todayPresenceState();
                }).catch(() => this.errorOccurred = true);
        if (this.errorOccurred)
            await this.alertService.ShowToast("Ocorreu um erro carregando as informações", undefined, "danger");
        this.isLoading = false;
    }

    ionViewDidLeave() {
        this.isLoading = false;
        this.errorOccurred = false;
        this.practitionerID = null;
        this.practitionerInfo = undefined;
    }

    public async deletePracBtn() {
        let confirmation = await this.alertService.ConfirmationAlert("Deseja deletar este aluno?", `"${this.practitionerInfo?.name}" desaparecerá para sempre`, "Não", "Sim");
        if (!confirmation)
            return;
        this.isLoading = true;
        await this.practitionerService.DeletePractitioner(this.practitionerID!).then(async () => {
            await this.router.navigate(["/practitioner-list"])
            await this.alertService.ShowToast("Aluno apagado com sucesso", undefined, "primary");
        }).catch(async () => await this.alertService.ShowToast("Aluno não pode ser apagado", undefined, "danger"));
        this.isLoading = false;
    }

    public todayPresenceState() {
        const today = new Date;
        let isPresent = undefined;
        for (let presence of this.practitionerInfo!.presenceLog!)
            if (presence.date.getDate() == today.getDate()) {
                isPresent = presence.wasPresent;
                break;
            }
        this.todayPresenceValue = (typeof isPresent != "undefined") ? (isPresent == true) ? "Presente" : "Faltou" : "Não marcado";
    }
}
