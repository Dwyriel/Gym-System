import {Injectable} from '@angular/core';
import {collection, doc, Firestore} from "@angular/fire/firestore";

@Injectable({
    providedIn: 'root'
})
export class DeviceIDService {
    private readonly collectionName: string = "devices";

    constructor(private firestore: Firestore, private storage: Storage) { }

    private docShort(id: string) {
        return doc(this.firestore, this.collectionName, id);
    }

    private colShort() {
        return collection(this.firestore, this.collectionName);
    }

    private checkDevices(){}
}
