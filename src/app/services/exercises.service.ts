import {Injectable} from '@angular/core';
import {Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, docData, query, startAt, endAt, limit, where, orderBy, getDocsFromCache, getDocFromCache, getCountFromServer} from "@angular/fire/firestore";
import {Exercise} from "../interfaces/exercise";

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
    public async CreateExercise(exerciseTemplate: Exercise) {
        if (!exerciseTemplate)
            return;
        return await addDoc(this.colExercShort(), {category: exerciseTemplate.category.trim(), name: exerciseTemplate.name.trim()});
    }

    /**
     * Updates an existing exercise on the database.
     * @param id the id of the exercise to be modified
     * @param exerciseTemplate the modifications that will be performed
     */
    public async UpdateExercise(id: string, exerciseTemplate: { category?: string, name?: string }) {
        if(exerciseTemplate.category)
            exerciseTemplate.category = exerciseTemplate.category.trim();
        if(exerciseTemplate.name)
            exerciseTemplate.name = exerciseTemplate.name.trim();
        return updateDoc(this.docExercShort(id), exerciseTemplate);
    }

    /**
     * Deletes an existing exercise on the database.
     * Note: practitioners that have this id should also be modified
     * @param id the id of the exercise that will be deleted
     */
    public async DeleteExercise(id: string) {
        return deleteDoc(this.docExercShort(id));
    }

    /**
     * Gets a specific exercise from the database
     * @param id the id of the exercise
     */
    public async GetExercise(id: string) {
        const doc = await getDoc(this.docExercShort(id));
        if (!doc.exists())
            return Promise.reject();
        let exercise: Exercise = doc.data() as Exercise;
        exercise.thisObjectID = doc.id;
        return Promise.resolve(exercise);
    }

    /**
     * Gets a specific exercise from cache
     * @param id the id of the exercise
     */
    public async GetExerciseFromCache(id: string) {
        try {
            const doc = await getDocFromCache(this.docExercShort(id));
            if (!doc.exists())
                return Promise.reject();
            let exercise: Exercise = doc.data() as Exercise;
            exercise.thisObjectID = doc.id;
            return Promise.resolve(exercise);
        } catch (exception) {
            return Promise.reject();
        }
    }

    /**
     * Gets an observable of a specific exercise
     * @param id the id of the exercise
     */
    public async GetExerciseObservable(id: string) {
        return docData(this.docExercShort(id));
    }

    /**
     * Gets all categories as an array of strings
     * @param exercises (optional) the array of ExerciseTemplate, if not passed it will be retrieved from the database
     * @return an array of strings containing only unique categories
     */
    public async GetAllCategories(exercises?: Exercise[]) {
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
        const allDocs = await getDocs(query(this.colExercShort(), startAt(from), endAt(to)));
        let arrayOfExercises: (Exercise)[] = [];
        allDocs.forEach(doc => {
            let exercise: Exercise = doc.data() as Exercise;
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
        const allDocs = await getDocs(query(this.colExercShort(), orderBy(field, direction), startAt(from), endAt(to)));
        let arrayOfExercises: (Exercise)[] = [];
        allDocs.forEach(doc => {
            let exercise: Exercise = doc.data() as Exercise;
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
        const allDocs = (maxEntries && maxEntries > 0) ? await getDocs(query(this.colExercShort(), where(field, "==", value), limit(maxEntries))) : await getDocs(query(this.colExercShort(), where(field, "==", value)));
        let arrayOfExercises: (Exercise)[] = [];
        allDocs.forEach(doc => {
            let exercise: Exercise = doc.data() as Exercise;
            exercise.thisObjectID = doc.id;
            arrayOfExercises.push(exercise);
        });
        return arrayOfExercises;
    }

    /**
     * Gets all the exercises from the database
     * @param maxEntries (optional) the total amount of entries to fetch
     * @return the result of the query as ExerciseTemplate[]
     */
    public async GetAllExercises(maxEntries?: number) {
        const allDocs = (maxEntries && maxEntries > 0) ? await getDocs(query(this.colExercShort(), limit(maxEntries))) : await getDocs(this.colExercShort());
        let arrayOfExercises: (Exercise)[] = [];
        allDocs.forEach(doc => {
            let exercise: Exercise = doc.data() as Exercise;
            exercise.thisObjectID = doc.id;
            arrayOfExercises.push(exercise);
        });
        return arrayOfExercises;
    }

    /**
     * Gets all the exercises from cache
     * @param maxEntries (optional) the total amount of entries to fetch
     * @return the result of the query as ExerciseTemplate[]
     */
    public async GetAllExercisesFromCache(maxEntries?: number) {
        try {
            const allDocs = (maxEntries && maxEntries > 0) ? await getDocsFromCache(query(this.colExercShort(), limit(maxEntries))) : await getDocsFromCache(this.colExercShort());
            let arrayOfExercises: (Exercise)[] = [];
            allDocs.forEach(doc => {
                let exercise: Exercise = doc.data() as Exercise;
                exercise.thisObjectID = doc.id;
                arrayOfExercises.push(exercise);
            });
            return arrayOfExercises;
        } catch (exception) {
            return [];
        }
    }

    /**
     * Gets all the exercises from the database
     * @param field the field of the object to order by
     * @param direction the direction to order by (ascending or descending)
     * @param maxEntries (optional) the total amount of entries to fetch
     * @return the result of the query as ExerciseTemplate[]
     */
    public async GetAllExercisesWithOrderBy(field: string, direction: 'desc' | 'asc', maxEntries?: number) {
        const allDocs = (maxEntries && maxEntries > 0) ? await getDocs(query(this.colExercShort(), orderBy(field, direction), limit(maxEntries))) : await getDocs(query(this.colExercShort(), orderBy(field, direction)));
        let arrayOfExercises: (Exercise)[] = [];
        allDocs.forEach(doc => {
            let exercise: Exercise = doc.data() as Exercise;
            exercise.thisObjectID = doc.id;
            arrayOfExercises.push(exercise);
        });
        return arrayOfExercises;
    }

    /**
     * Gets the amount of exercise docs currently created.
     */
    public async GetExerciseCount() {
        try {
            const doc = await getCountFromServer(this.colExercShort());
            return doc.data().count;
        } catch (exception) {
            return Promise.reject();
        }
    }
}
