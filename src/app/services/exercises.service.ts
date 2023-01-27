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
        return await addDoc(this.colShort(), exerciseTemplate);
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
        let exercise: ExerciseTemplate = doc.data() as ExerciseTemplate;
        exercise.thisObjectID = doc.id;
        return Promise.resolve(exercise);
    }

    public async GetExerciseObservable(id: string) {
        return docData(this.docShort(id));
    }

    public async GetAllCategories() {
        let exercises = await this.GetAllExercises();
        let cats: string[] = [];
        exercises.forEach(exercise => cats.push(exercise.category));
        return cats;
    }

    public async GetAllExercises() {
        const allDocs = await getDocs(this.colShort());
        let arrayOfExercises: (ExerciseTemplate)[] = [];
        allDocs.forEach(doc => {
            let exercise: ExerciseTemplate = doc.data() as ExerciseTemplate;
            exercise.thisObjectID = doc.id;
            arrayOfExercises.push(exercise);
        });
        return arrayOfExercises;
    }
}
