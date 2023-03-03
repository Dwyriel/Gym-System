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
    public practitionerID: string | null = null;

    //todo load presences, change button icon accordingly to today's checkin
    constructor(private router: Router, private activatedRoute: ActivatedRoute, private accountService: AccountService, private practitionerService: PractitionerService, private alertService: AlertService) { }

    async ionViewWillEnter() {
        this.isLoading = true;
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");
        let errorOccurred = false;
        await this.practitionerService.GetPractitioner(this.practitionerID!)
            .then(result => this.practitionerInfo = result).catch(async () => errorOccurred = true);
        if (!errorOccurred)
            await this.practitionerService.GetPractitionersPresences(this.practitionerInfo!.presenceLogID)
                .then(result => this.practitionerInfo!.presenceLog = result).catch(() => errorOccurred = true);
        if (errorOccurred)
            await this.alertService.ShowToast("Ocorreu um erro carregando as informações", undefined, "danger")
        this.isLoading = false;
    }

    ionViewDidLeave() {
        this.isLoading = false;
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

    async addPresence() {
        await this.practitionerService.AddPresence(this.practitionerInfo!.presenceLogID, {date: new Date(Date.now()), wasPresent: true});
        //todo popover, check if checkin already happened, delete older checkin if so then replace it
    }
}
