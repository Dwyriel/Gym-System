import {Injectable} from '@angular/core';
import {collection, doc, Firestore, getCountFromServer, setDoc} from "@angular/fire/firestore";
import {Preferences} from '@capacitor/preferences';
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DeviceIDService {
    private readonly collectionName: string = "devices";
    private readonly storageDeviceNameKey: string = "deviceName";
    private readonly namePrefixWithSpace: string = "Dispositivo ";

    private deviceName = new BehaviorSubject<string | null>(null);

    constructor(private firestore: Firestore) { }

    private docShort(id: string) {
        return doc(this.firestore, this.collectionName, id);
    }

    private colShort() {
        return collection(this.firestore, this.collectionName);
    }

    public async SetDeviceName() {
        let deviceName = (await Preferences.get({key: this.storageDeviceNameKey})).value;
        if (!deviceName) {
            deviceName = this.namePrefixWithSpace + ((await getCountFromServer(this.colShort())).data().count + 1);
            await setDoc(this.docShort(deviceName), {deviceName: deviceName});
            await Preferences.set({key: this.storageDeviceNameKey, value: deviceName});
        }
        this.deviceName.next(deviceName);
    }

    public GetDeviceName() {
        return this.deviceName.value;
    }

    public GetDeviceNameObservable() {
        return this.deviceName;
    }
}
