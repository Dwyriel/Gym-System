import {Component} from '@angular/core';
import {waitForFirebaseResponse} from "../../services/app.utility";
import {AccountService} from "../../services/account.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Practitioner} from "../../classes/practitioner";
import {PractitionerService} from "../../services/practitioner.service";
import {AppInfoService} from "../../services/app-info.service";
import {AlertService} from "../../services/alert.service";

@Component({
    selector: 'app-practitioner-form',
    templateUrl: './practitioner-form.page.html',
    styleUrls: ['./practitioner-form.page.scss'],
})
export class PractitionerFormPage {

    public practitioner: Practitioner = new Practitioner();
    public isLoading: boolean = false;
    public practitionerID?: string | null;

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private practitionerService: PractitionerService, private alertService: AlertService, private accountService: AccountService) {}

    async ionViewWillEnter() {
        this.isLoading = true;
        this.practitionerID = this.activatedRoute.snapshot.paramMap.get("id");
        if (!(await waitForFirebaseResponse(this.accountService)))
            return;
        if (this.practitionerID)
            await this.getPractitionerFromFirebase();
        this.isLoading = false;
    }

    ionViewDidLeave() {
        this.isLoading = false;
        this.practitionerID = null;
        this.practitioner = new Practitioner();
    }

    async getPractitionerFromFirebase() {
        await this.practitionerService.GetPractitioner(this.practitionerID!).then(practitioner => {
            this.practitioner = practitioner
        }).catch(() => {
            this.practitionerID = null;
            this.practitioner = new Practitioner();
        });
    }

    async EnterPressed() {
        if (this.practitioner.name)
            await this.OnClick();
    }

    async OnClick() {
        if (!AppInfoService.AppInfo?.isOnline) {
            await this.alertService.ShowToast("Dispositivo não esta conectado a internet", undefined, "danger");
            return;
        }
        let functionResult: Promise<any> = (this.practitionerID) ? this.UpdatePractitioner() : this.CreatePractitioner();
        await functionResult.then(async () => {
            await this.router.navigate([(this.practitionerID) ?  "/practitioner-profile/"+this.practitionerID : "/practitioner-list"]);
            await this.alertService.ShowToast((this.practitionerID) ? "Aluno alterado com sucesso" : "Aluno criado com sucesso", undefined, "primary");
        }).catch(async () => {
            this.isLoading = false;
            await this.alertService.ShowToast((this.practitionerID) ? "Não foi possível alterar o aluno" : "Não foi possível criar o aluno", undefined, "danger");
        });
    }

    async CreatePractitioner() {
        this.isLoading = true;
        return this.practitionerService.CreatePractitioner(this.practitioner);
    }

    async UpdatePractitioner() {
        this.isLoading = true;
        return this.practitionerService.UpdatePractitioner(this.practitionerID!, this.practitioner);
    }
}
