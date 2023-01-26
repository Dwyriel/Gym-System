import {Injectable} from '@angular/core';
import {Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, docData} from "@angular/fire/firestore";
import {ExerciseTemplate} from "../interfaces/exercise";

@Injectable({
    providedIn: 'root'
})
export class ExercisesService {
    private readonly collectionName: string = "exercises";

    constructor(private firestore: Firestore) { }

    private docShort(id: string) {
        return doc(this.firestore, this.collectionName, id);
    }

    private colShort() {
        return collection(this.firestore, this.collectionName);
    }

    /**
     * Creates a new Exercise on the database.
     * @param exerciseTemplate the exercise to be added into the database
     * @return the id of the object on the database
     */
    public async CreateExercise(exerciseTemplate: ExerciseTemplate) {
        if (!exerciseTemplate)
            return;
        const ref = await addDoc(this.colShort(), exerciseTemplate);
        return ref.id;
    }

    /**
     * Updates an existing exercise on the database.
     * @param id the id of the exercise to be modified
     * @param exerciseTemplate the modifications that will be performed
     */
    public async UpdateExercise(id: string, exerciseTemplate: { category?: string, name?: string }) {
        return updateDoc(this.docShort(id), exerciseTemplate);
    }

    /**
     * Deletes an existing exercise on the database.
     * Note: practitioners that have this id should also be modified
     * @param id the id of the exercise that will be deleted
     */
    public async DeleteExercise(id: string) {
        return deleteDoc(this.docShort(id));
    }

    public async GetExercise(id: string) {
        const doc = await getDoc(this.docShort(id));
        if (!doc.exists())
            return Promise.reject();
        return Promise.resolve(doc.data() as ExerciseTemplate);
    }

    public async GetExerciseObservable(id: string) {
        return docData(this.docShort(id));
    }

    public async GetAllExercises() {
        const allDocs = await getDocs(this.colShort());
        let arrayOfExercises: (ExerciseTemplate)[] = [];
        allDocs.forEach(doc => arrayOfExercises.push(doc.data() as ExerciseTemplate));
        return arrayOfExercises;
    }
}
