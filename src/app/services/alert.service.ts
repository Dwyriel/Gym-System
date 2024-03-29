import {Injectable} from '@angular/core';
import {ActionSheetController, AlertController, LoadingController, ToastController} from "@ionic/angular";
import {Color} from "@ionic/core";

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    constructor(private loadingController: LoadingController, private alertController: AlertController, private toastController: ToastController, private actionSheetController: ActionSheetController) { }

    /**Creates and shows a loading popup.
     * @returns the id of the element created.
     * @param message (Optional) the custom message
     */
    async PresentLoading(message?: string | null | undefined) {
        const loading = await this.loadingController.create({
            message: message ? message : 'Loading!',
            backdropDismiss: true
        });
        await loading.present();
        return loading.id;
    }

    /**dismisses the top overlay, or the overlay with the id, if provided.*/
    async DismissLoading(id?: string) {//made some changes on this class. might not work as intended.
        await this.loadingController.dismiss(undefined, undefined, (id) ? id : undefined);
    }

    /**Creates and presents an alert message.
     * @param title the title shown on the top of the alert message
     * @param description the text shown in the middle of the alert message
     */
    async PresentAlert(title: string, description?: string) {
        const alert = await this.alertController.create({
            header: title,
            message: description ? description : "",
            buttons: ['Ok'],
        });
        await alert.present();
        return alert.id;
    }

    /**Creates and presents an alert message with 2 buttons and a return.
     * @param title the title shown on the top of the alert message
     * @param description the text shown in the middle of the alert message
     * @param buttonCancelText (Optional) the text shown for the "Cancel" button
     * @param buttonOkText (Optional) the text shown for the "Ok" button
     * @returns a boolean value based on the button the user pressed. true for ok, false for cancel.
     */
    async ConfirmationAlert(title: string, description?: string, buttonCancelText?: string | null | undefined, buttonOkText?: string | null | undefined): Promise<boolean> {
        const alert = await this.alertController.create({
            header: title,
            message: description ? description : "",
            buttons: [
                {
                    text: buttonCancelText ? buttonCancelText : 'Cancel',
                    handler: () => {
                        alert.dismiss(false);
                        return false;
                    }
                }, {
                    text: buttonOkText ? buttonOkText : 'Ok',
                    handler: () => {
                        alert.dismiss(true);
                        return false;
                    }
                }
            ]
        });
        let returned = false;
        await alert.present();
        await alert.onDidDismiss().then((data) => { returned = data.data as boolean; });
        return returned;
    }

    /**Creates and presents an alert message with 3 buttons and a return.
     * @param title the title shown on the top of the alert message
     * @param description the text shown in the middle of the alert message
     * @param buttonFirstOptionText (Optional) the text shown for the "Yes" button, return 2 if clicked
     * @param buttonSecondOptionText (Optional) the text shown for the "No" button, return 1 if clicked
     * @param buttonCancelText (Optional) the text shown for the "Cancel" button, return 0 if clicked
     * @returns a number based on the button the user pressed. check button descriptions.
     */
    async ConfirmationAlertThreeButtons(title: string, description?: string, buttonFirstOptionText?: string | null | undefined, buttonSecondOptionText?: string | null | undefined, buttonCancelText?: string | null | undefined): Promise<number> {
        const alert = await this.alertController.create({
            header: title,
            message: description ? description : "",
            buttons: [
                {
                    text: buttonFirstOptionText ? buttonFirstOptionText : 'Yes',
                    handler: () => {
                        alert.dismiss(2);
                        return false;
                    }
                },
                {
                    text: buttonSecondOptionText ? buttonSecondOptionText : 'No',
                    handler: () => {
                        alert.dismiss(1);
                        return false;
                    }
                },
                {
                    text: buttonCancelText ? buttonCancelText : 'Cancel',
                    handler: () => {
                        alert.dismiss(0);
                        return false;
                    }
                }
            ]
        });
        let returned = 0;
        await alert.present();
        await alert.onDidDismiss().then((data) => { returned = data.data as number; });
        return returned;
    }

    async TextInputAlert(title: string, placeholder: string, buttonOkText?: string | null | undefined) {
        const alert = await this.alertController.create({
            header: title,
            inputs: [
                {
                    placeholder: placeholder,
                    name: "text",
                    type: "text"
                },
            ],
            buttons: [
                {
                    text: buttonOkText ? buttonOkText : "Ok",
                    handler: (data) => {
                        alert.dismiss(data);
                        return false;
                    }
                }
            ],

        });
        let text: string | null = null;
        await alert.present();
        await alert.onDidDismiss().then(({data}) => {
            if (data)
                text = data.text;
        });
        return text;
    }

    /**Creates and presents a toast.
     * @param text the text of the toast.
     * @param duration (Optional) the amount of time in ms the toast will be shown to the user, default is 2000ms.
     * @param color (Optional) the color of the toast, default is "tertiary"
     * @returns the created toast's id.
     */
    async ShowToast(text: string, duration?: number, color?: Color | undefined) {
        const toast = await this.toastController.create({
            message: text,
            color: color ? color : "tertiary",
            duration: (duration) ? duration : 2000,
            animated: true,
            mode: "ios"
        });
        await toast.present();
        return toast.id;
    }

    //leaving the structure so it can be changed and used later
    /**Not yet functional
     */
    async presentActionSheet() {
        let variable;
        const actionSheet = await this.actionSheetController.create({
            header: 'to be changed header',
            cssClass: 'my-custom-class',
            buttons: [{
                text: 'title 1',
                handler: () => {
                    actionSheet.dismiss("Return 1");
                    return false;
                }
            }, {
                text: 'title 2',
                handler: () => {
                    actionSheet.dismiss("Return 2");
                    return false;
                }
            }, {
                text: 'title 3',
                handler: () => {
                    actionSheet.dismiss("Return 3");
                    return false;
                }
            }, {
                text: 'Cancel',
                role: 'cancel',
                handler: () => { }
            }]
        });
        await actionSheet.present();
        await actionSheet.onDidDismiss().then((data) => { variable = data.data });
        return variable;
    }
}
