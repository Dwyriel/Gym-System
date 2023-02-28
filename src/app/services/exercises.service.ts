import {Injectable} from '@angular/core';
import {Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, docData, query, startAt, endAt, limit, where, orderBy} from "@angular/fire/firestore";
import {ExerciseTemplate} from "../interfaces/exercise";
import {AccountService} from "./account.service";

@Injectable({
    providedIn: 'root'
})
export class ExercisesService {
    private readonly collectionName: string = "exercises";

    constructor(private firestore: Firestore) { }

    private docShort(id: string) {
        return doc(this.firestore, this.collectionName + AccountService.CurrentUserUID, id);
    }

    private colShort() {
        return collection(this.firestore, this.collectionName + AccountService.CurrentUserUID);
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

    /**
     * Gets a specific exercise from the database
     * @param id the id of the exercise
     */
    public async GetExercise(id: string) {
        const doc = await getDoc(this.docShort(id));
        if (!doc.exists())
            return Promise.reject();
        let exercise: ExerciseTemplate = doc.data() as ExerciseTemplate;
        exercise.thisObjectID = doc.id;
        return Promise.resolve(exercise);
    }

    /**
     * Gets an observable of a specific exercise
     * @param id the id of the exercise
     */
    public async GetExerciseObservable(id: string) {
        return docData(this.docShort(id));
    }

    /**
     * Gets all categories as an array of strings
     * @param exercises (optional) the array of ExerciseTemplate, if not passed it will be retrieved from the database
     * @return an array of strings containing only unique categories
     */
    public async GetAllCategories(exercises?: ExerciseTemplate[]) {
        if (!exercises)
            exercises = await this.GetAllExercises();
        let cats: string[] = [];
        exercises.forEach(exercise => cats.push(exercise.category));
        cats = [...new Set(cats)];
        return cats;
    }

    /**
     * Gets all exercises with a certain limit
     * @param from the entry to start at (inclusive)
     * @param to the entry to end at (inclusive)
     * @return the result of the query as ExerciseTemplate[]
     */
    public async GetAllFromRange(from: number, to: number) {
        const allDocs = await getDocs(query(this.colShort(), startAt(from), endAt(to)));
        let arrayOfExercises: (ExerciseTemplate)[] = [];
        allDocs.forEach(doc => {
            let exercise: ExerciseTemplate = doc.data() as ExerciseTemplate;
            exercise.thisObjectID = doc.id;
            arrayOfExercises.push(exercise);
        });
        return arrayOfExercises;
    }

    /**
     * Gets all exercises with a certain limit and at a certain order
     * @param from the entry to start at (inclusive)
     * @param to the entry to end at (inclusive)
     * @param field the field of the object to order by
     * @param direction the direction to order by (ascending or descending)
     * @return the result of the query as ExerciseTemplate[]
     */
    public async GetAllFromRangeWithOrderBy(from: number, to: number, field: string, direction: 'desc' | 'asc') {
        const allDocs = await getDocs(query(this.colShort(), orderBy(field, direction), startAt(from), endAt(to)));
        let arrayOfExercises: (ExerciseTemplate)[] = [];
        allDocs.forEach(doc => {
            let exercise: ExerciseTemplate = doc.data() as ExerciseTemplate;
            exercise.thisObjectID = doc.id;
            arrayOfExercises.push(exercise);
        });
        return arrayOfExercises;
    }

    /**
     * Gets all exercises matching a certain value in a field
     * @param field the field of the object that will be used to match
     * @param value the value that the field should match
     * @param maxEntries (optional) the total amount of entries to fetch
     * @return the result of the query as ExerciseTemplate[]
     */
    public async GetAllMatching(field: string, value: string, maxEntries?: number) {
        const allDocs = (maxEntries && maxEntries > 0) ? await getDocs(query(this.colShort(), where(field, "==", value), limit(maxEntries))) : await getDocs(query(this.colShort(), where(field, "==", value)));
        let arrayOfExercises: (ExerciseTemplate)[] = [];
        allDocs.forEach(doc => {
            let exercise: ExerciseTemplate = doc.data() as ExerciseTemplate;
            exercise.thisObjectID = doc.id;
            arrayOfExercises.push(exercise);
        });
        return arrayOfExercises;
    }

    /**
     * Gets all the exercises in the database
     * @param maxEntries (optional) the total amount of entries to fetch
     * @return the result of the query as ExerciseTemplate[]
     */
    public async GetAllExercises(maxEntries?: number) {
        const allDocs = (maxEntries && maxEntries > 0) ? await getDocs(query(this.colShort(), limit(maxEntries))) : await getDocs(this.colShort());
        let arrayOfExercises: (ExerciseTemplate)[] = [];
        allDocs.forEach(doc => {
            let exercise: ExerciseTemplate = doc.data() as ExerciseTemplate;
            exercise.thisObjectID = doc.id;
            arrayOfExercises.push(exercise);
        });
        return arrayOfExercises;
    }

    /**
     * Gets all the exercises in the database
     * @param field the field of the object to order by
     * @param direction the direction to order by (ascending or descending)
     * @param maxEntries (optional) the total amount of entries to fetch
     * @return the result of the query as ExerciseTemplate[]
     */
    public async GetAllExercisesWithOrderBy(field: string, direction: 'desc' | 'asc', maxEntries?: number) {
        const allDocs = (maxEntries && maxEntries > 0) ? await getDocs(query(this.colShort(), orderBy(field, direction), limit(maxEntries))) : await getDocs(query(this.colShort(), orderBy(field, direction)));
        let arrayOfExercises: (ExerciseTemplate)[] = [];
        allDocs.forEach(doc => {
            let exercise: ExerciseTemplate = doc.data() as ExerciseTemplate;
            exercise.thisObjectID = doc.id;
            arrayOfExercises.push(exercise);
        });
        return arrayOfExercises;
    }
}
