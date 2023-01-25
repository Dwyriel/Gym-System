import {Injectable} from '@angular/core';
import {addDoc, collection, deleteDoc, doc, docData, Firestore, getDoc, getDocs, updateDoc} from "@angular/fire/firestore";
import {Practitioner} from "../classes/practitioner";

@Injectable({
    providedIn: 'root'
})
export class PractitionerService {
    private readonly collectionName: string = "practitioners";

    constructor(private firestore: Firestore) { }

    private docShort(id: string) {
        return doc(this.firestore, this.collectionName, id);
    }

    private colShort() {
        return collection(this.firestore, this.collectionName);
    }

    /**
     * Creates a new practitioner on the database.
     * @param practitioner the practitioner to be added into the database
     * @return the id of the object on the database
     */
    public async CreatePractitioner(practitioner: Practitioner) {
        if (!practitioner)
            return;
        const ref = await addDoc(this.colShort(), {
            formCreationDate: practitioner.formCreationDate.getTime(),
            name: practitioner.name,
            objectives: practitioner.objectives,
            observations: practitioner.observations,
            exercisesID: practitioner.exercisesID,
            frequencyLogID: practitioner.frequencyLogID
        });
        return ref.id;
    }

    /**
     * Updates an existing practitioner on the database.
     * @param id the id of the practitioner to be modified
     * @param practitioner the modifications that will be performed
     */
    public async UpdatePractitioner(id: string, practitioner: { name?: string, objectives?: string, observations?: string }) {
        return updateDoc(this.docShort(id), practitioner);
    }

    /**
     * Deletes an existing practitioner on the database.
     * @param id the id of the practitioner that will be deleted
     */
    public async DeleteExercise(id: string) {
        return deleteDoc(this.docShort(id));
    }

    public async GetPractitioner(id: string) {
        const doc = await getDoc(this.docShort(id));
        if (!doc.exists())
            return Promise.reject();
        return Promise.resolve(doc.data() as Practitioner);
    }

    public async GetPractitionerObservable(id: string) {
        return docData(this.docShort(id));
    }

    public async GetAllPractitioners() {
        const allDocs = await getDocs(this.colShort());
        let arrayOfPractitioner: (Practitioner)[] = [];
        allDocs.forEach(doc => arrayOfPractitioner.push(doc.data() as Practitioner));
        return arrayOfPractitioner;
    }
}
