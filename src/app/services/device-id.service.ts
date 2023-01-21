import {Injectable} from '@angular/core';
import {collection, doc, Firestore, getCountFromServer, setDoc} from "@angular/fire/firestore";
import {Preferences} from '@capacitor/preferences';

@Injectable({
    providedIn: 'root'
})
export class DeviceIDService {
    private readonly collectionName: string = "devices";
    private readonly storageDeviceNameKey: string = "deviceName";
    private readonly namePrefixWithSpace: string = "Dispositivo ";

    private deviceName: string | null = null;

    constructor(private firestore: Firestore) { }

    private docShort(id: string) {
        return doc(this.firestore, this.collectionName, id);
    }

    private colShort() {
        return collection(this.firestore, this.collectionName);
    }

    public async SetDeviceName() {
        this.deviceName = (await Preferences.get({key: this.storageDeviceNameKey})).value;
        if (this.deviceName)
            return;
        this.deviceName = this.namePrefixWithSpace + ((await getCountFromServer(this.colShort())).data().count + 1);
        await setDoc(this.docShort(this.deviceName), {"deviceName": this.deviceName});
        await Preferences.set({key: this.storageDeviceNameKey, value: this.deviceName});
    }

    public GetDeviceName() {
        return this.deviceName;
    }
}
