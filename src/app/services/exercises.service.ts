import {Injectable} from '@angular/core';
import {Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, docData, query, startAt, endAt, limit, where, orderBy, getDocsFromCache, getDocFromCache, getCountFromServer} from "@angular/fire/firestore";
import {Exercise} from "../interfaces/exercise";
import {ExerciseTemplate} from "../interfaces/exercise-template";

@Injectable({
    providedIn: 'root'
})
export class ExercisesService {
    private readonly exerciseCollectionName: string = "exercises";
    private readonly templateCollectionName: string = "exerciseTemplates";

    constructor(private firestore: Firestore) { }

    private docExercShort(id: string) {
        return doc(this.firestore, this.exerciseCollectionName, id);
    }

    private colExercShort() {
        return collection(this.firestore, this.exerciseCollectionName);
    }

    private docTemplateShort(id: string) {
        return doc(this.firestore, this.templateCollectionName, id);
    }

    private colTemplateShort() {
        return collection(this.firestore, this.templateCollectionName);
    }

    /**
     * Creates a new Exercise on the database.
     * @param exercise the exercise to be added into the database
     * @return the id of the object on the database
     */
    public async CreateExercise(exercise: Exercise) {
        if (!exercise)
            return;
        return await addDoc(this.colExercShort(), {category: exercise.category.trim(), name: exercise.name.trim()});
    }

    /**
     * Creates a new ExerciseTemplate on the database.
     * @param exerciseTemplate the exerciseTemplate to be added into the database
     * @return the id of the object on the database
     */
    public async CreateExerciseTemplate(exerciseTemplate: ExerciseTemplate) {
        if (!exerciseTemplate)
            return;
        return await addDoc(this.colTemplateShort(), {name: exerciseTemplate.name.trim(), exerciseIDs: exerciseTemplate.exerciseIDs});
    }

    /**
     * Updates an existing exercise on the database.
     * @param id the id of the exercise to be modified
     * @param exercise the modifications that will be performed
     */
    public async UpdateExercise(id: string, exercise: { category?: string, name?: string }) {
        let obj: any = {};
        if (exercise.category)
            obj["category"] = exercise.category.trim();
        if (exercise.name)
            obj["name"] = exercise.name.trim();
        if (Object.keys(obj).length < 1)
            return;
        return updateDoc(this.docExercShort(id), obj);
    }

    /**
     * Updates an existing exerciseTemplate on the database.
     * @param id the id of the exerciseTemplate to be modified
     * @param exercise the modifications that will be performed
     */
    public async UpdateExerciseTemplate(id: string, exercise: { name?: string, exerciseIDs?: string[] }) {
        let obj: any = {};
        if (exercise.name)
            obj['name'] = exercise.name.trim();
        if (exercise.exerciseIDs && exercise.exerciseIDs.length > 0)
            obj['exerciseIDs'] = exercise.exerciseIDs;
        if (Object.keys(obj).length < 1)
            return;
        return updateDoc(this.docTemplateShort(id), obj);
    }

    /**
     * Deletes an existing exercise on the database.
     * Note: practitioners and exerciseTemplates that have this id should also be modified
     * @param id the id of the exercise that will be deleted
     */
    public async DeleteExercise(id: string) {
        return deleteDoc(this.docExercShort(id));
    }

    /**
     * Deletes an existing exerciseTemplate on the database.
     * @param id the id of the exerciseTemplate that will be deleted
     */
    public async DeleteExerciseTemplate(id: string) {
        return deleteDoc(this.docTemplateShort(id));
    }

    /**
     * Gets a specific exercise from the database
     * @param id the id of the exercise
     * @throws if doc doesn't exist, returning {docExists: false}
     */
    public async GetExercise(id: string) {
        const doc = await getDoc(this.docExercShort(id));
        if (!doc.exists())
            return Promise.reject({docExists: false});
        let exercise: Exercise = doc.data() as Exercise;
        exercise.thisObjectID = doc.id;
        return Promise.resolve(exercise);
    }

    /**
     * Gets a specific exerciseTemplate from the database
     * @param id the id of the exerciseTemplate
     * @throws if doc doesn't exist, returning {docExists: false}
     */
    public async GetExerciseTemplate(id: string) {
        const doc = await getDoc(this.docTemplateShort(id));
        if (!doc.exists())
            return Promise.reject({docExists: false});
        let exercise: ExerciseTemplate = doc.data() as ExerciseTemplate;
        exercise.thisObjectID = doc.id;
        return Promise.resolve(exercise);
    }

    /**
     * Gets a specific exercise from cache
     * @param id the id of the exercise
     * @throws if doc doesn't exist, returning {docExists: false}
     */
    public async GetExerciseFromCache(id: string) {
        try {
            const doc = await getDocFromCache(this.docExercShort(id));
            if (!doc.exists())
                return Promise.reject({docExists: false});
            let exercise: Exercise = doc.data() as Exercise;
            exercise.thisObjectID = doc.id;
            return Promise.resolve(exercise);
        } catch (exception) {
            return Promise.reject();
        }
    }

    /**
     * Gets a specific exerciseTemplate from cache
     * @param id the id of the exerciseTemplate
     * @throws if doc doesn't exist, returning {docExists: false}
     */
    public async GetExerciseTemplateFromCache(id: string) {
        try {
            const doc = await getDocFromCache(this.docTemplateShort(id));
            if (!doc.exists())
                return Promise.reject({docExists: false});
            let exercise: ExerciseTemplate = doc.data() as ExerciseTemplate;
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
     * Gets an observable of a specific exerciseTemplate
     * @param id the id of the exerciseTemplate
     */
    public async GetExerciseTemplateObservable(id: string) {
        return docData(this.docTemplateShort(id));
    }

    /**
     * Gets all categories as an array of strings
     * @param exercises (optional) the array of Exercise, if not passed it will be retrieved from the database
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
     * Gets all the exercises of a exerciseTemplate
     * @param exerciseIDs the array of id of exercises to fetch (aka ExerciseTemplate.exerciseIDs)
     * @return the result of the query as Exercise[]
     */
    public async GetTemplatesExercises(exerciseIDs: string[]) {
        try {
            let exercises: Exercise[] = [];
            for (let exerciseID of exerciseIDs) {
                let cacheError = false;
                await this.GetExerciseFromCache(exerciseID).then(value => exercises.push(value)).catch(() => cacheError = true);
                if (cacheError)
                    exercises.push(await this.GetExercise(exerciseID));
            }
            return Promise.resolve(exercises);
        } catch (exception) {
            return Promise.reject();
        }
    }

    /**
     * Gets all exercises with a certain limit
     * @param from the entry to start at (inclusive)
     * @param to the entry to end at (inclusive)
     * @return the result of the query as Exercise[]
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
     * @return the result of the query as Exercise[]
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
     * @return the result of the query as Exercise[]
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
     * @return the result of the query as Exercise[]
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
     * Gets all the exerciseTemplates from the database
     * @param maxEntries (optional) the total amount of entries to fetch
     * @return the result of the query as ExerciseTemplate[]
     */
    public async GetAllExerciseTemplates(maxEntries?: number) {
        const allDocs = (maxEntries && maxEntries > 0) ? await getDocs(query(this.colTemplateShort(), limit(maxEntries))) : await getDocs(this.colTemplateShort());
        let arrayOfExerciseTemplates: (ExerciseTemplate)[] = [];
        allDocs.forEach(doc => {
            let template: ExerciseTemplate = doc.data() as ExerciseTemplate;
            template.thisObjectID = doc.id;
            arrayOfExerciseTemplates.push(template);
        });
        return arrayOfExerciseTemplates;
    }

    /**
     * Gets all the exercises from cache
     * @param maxEntries (optional) the total amount of entries to fetch
     * @return the result of the query as Exercise[]
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
            return Promise.reject();
        }
    }

    /**
     * Gets all the exerciseTemplates from the database
     * @param maxEntries (optional) the total amount of entries to fetch
     * @return the result of the query as ExerciseTemplate[]
     */
    public async GetAllExerciseTemplatesFromCache(maxEntries?: number) {
        try {
            const allDocs = (maxEntries && maxEntries > 0) ? await getDocsFromCache(query(this.colTemplateShort(), limit(maxEntries))) : await getDocsFromCache(this.colTemplateShort());
            let arrayOfExerciseTemplates: (ExerciseTemplate)[] = [];
            allDocs.forEach(doc => {
                let template: ExerciseTemplate = doc.data() as ExerciseTemplate;
                template.thisObjectID = doc.id;
                arrayOfExerciseTemplates.push(template);
            });
            return arrayOfExerciseTemplates;
        } catch (exception) {
            return Promise.reject();
        }
    }

    /**
     * Gets all the exercises from the database
     * @param field the field of the object to order by
     * @param direction the direction to order by (ascending or descending)
     * @param maxEntries (optional) the total amount of entries to fetch
     * @return the result of the query as Exercise[]
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

    /**
     * Gets the amount of exerciseTemplate docs currently created.
     */
    public async GetExerciseTemplateCount() {
        try {
            const doc = await getCountFromServer(this.colTemplateShort());
            return doc.data().count;
        } catch (exception) {
            return Promise.reject();
        }
    }
}
