import {Injectable} from '@angular/core';
import {Firestore, addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, endAt, getDoc, getDocFromCache, getDocs, getDocsFromCache, limit, query, startAt, updateDoc} from "@angular/fire/firestore";
import {Practitioner} from "../classes/practitioner";
import {Exercise} from "../interfaces/exercise";
import {Presence} from "../interfaces/frequency-log";
import {ExercisesService} from "./exercises.service";

@Injectable({
    providedIn: 'root'
})
export class PractitionerService {
    private readonly practitionerCollectionName: string = "practitioners";
    private readonly practitionerExerciseCollectionName: string = "practitionerExercises";
    private readonly practitionerPresenceCollectionName: string = "practitionerPresences";

    constructor(private firestore: Firestore, private exercisesService: ExercisesService) { }

    private docPracShort(id: string) {
        return doc(this.firestore, this.practitionerCollectionName, id);
    }

    private docExerShort(id: string) {
        return doc(this.firestore, this.practitionerExerciseCollectionName, id);
    }

    private docPresShort(id: string) {
        return doc(this.firestore, this.practitionerPresenceCollectionName, id);
    }

    private colPracShort() {
        return collection(this.firestore, this.practitionerCollectionName);
    }

    private colExerShort() {
        return collection(this.firestore, this.practitionerExerciseCollectionName);
    }

    private colFreqShort() {
        return collection(this.firestore, this.practitionerPresenceCollectionName);
    }

    /**
     * Creates a new practitioner on the database.
     * @param practitioner the practitioner to be added into the database
     * @return the id of the object on the database
     */
    public async CreatePractitioner(practitioner: Practitioner) {
        if (!practitioner)
            return;
        const exerRef = await addDoc(this.colExerShort(), {items: []});
        if (!exerRef)
            return undefined;
        const presRef = await addDoc(this.colFreqShort(), {items: []});
        if (!presRef)
            return undefined;
        return addDoc(this.colPracShort(), {
            formCreationDate: practitioner.formCreationDate.getTime(),
            name: practitioner.name,
            objectives: practitioner.objectives,
            observations: practitioner.observations,
            exercisesID: exerRef.id,
            presenceLogID: presRef.id
        });
    }

    /**
     * Updates an existing practitioner on the database.
     * @param id the id of the practitioner to be modified
     * @param practitioner the modifications that will be performed
     */
    public async UpdatePractitioner(id: string, practitioner: { name?: string, objectives?: string, observations?: string }) {
        return updateDoc(this.docPracShort(id), practitioner);
    }

    /**
     * Updates an existing practitioner's exercise array on the database, adding a new entry.
     * @param id the id of the array of exercises (aka practitioner.exercisesID)
     * @param exercise the exercise that will be added
     */
    public async AddExercise(id: string, exercise: Exercise) {
        return updateDoc(this.docExerShort(id), {
            items: arrayUnion({
                exerciseID: exercise.exerciseID,
                series: exercise.series,
                repetition: exercise.repetition,
                rest: exercise.rest,
                load: exercise.load,
            })
        });
    }

    /**
     * Updates an existing practitioner's presence array on the database, adding a new entry. time will always be changed to 12pm before running the query.
     * @param id the id of the array of presences (aka practitioner.presenceLogID)
     * @param presence the presence that will be added
     */
    public async AddPresence(id: string, presence: Presence) {
        presence.date.setHours(12, 0, 0);
        return updateDoc(this.docPresShort(id), {
            items: arrayUnion({
                date: presence.date.getTime(),
                wasPresent: presence.wasPresent
            })
        });
    }

    /**
     * Removes an exercise from a practitioner's exercise array.
     * @param id the id of the array of exercises (aka practitioner.exercisesID)
     * @param exercise the exercise that will be removed
     */
    public async RemoveExercise(id: string, exercise: Exercise) {
        return updateDoc(this.docExerShort(id), {
            items: arrayRemove({
                exerciseID: exercise.exerciseID,
                series: exercise.series,
                repetition: exercise.repetition,
                rest: exercise.rest,
                load: exercise.load,
            })
        });
    }

    /**
     * Removes a presence from a practitioner's presence array.
     * @param id the id of the array of presences (aka practitioner.presenceLogID)
     * @param presence the presence that will be removed
     */
    public async RemovePresence(id: string, presence: Presence) {
        return updateDoc(this.docPresShort(id), {
            items: arrayRemove({
                date: presence.date.getTime(),
                wasPresent: presence.wasPresent
            })
        });
    }

    /**
     * Clears the practitioner's exercise array.
     * @param id the id of the array of exercises (aka practitioner.exercisesID)
     */
    public async ClearExercises(id: string) {
        return updateDoc(this.docExerShort(id), {items: []});
    }

    /**
     * Clears the practitioner's presence array.
     * @param id the id of the array of presences (aka practitioner.presenceLogID)
     */
    public async ClearPresences(id: string) {
        return updateDoc(this.docPresShort(id), {items: []});
    }

    /**
     * Deletes an existing practitioner on the database.
     * @param id the id of the practitioner that will be deleted
     */
    public async DeletePractitioner(id: string) {
        let practitioner = await this.GetPractitioner(id);
        await deleteDoc(this.docExerShort(practitioner.exercisesID));
        await deleteDoc(this.docPresShort(practitioner.presenceLogID));
        return deleteDoc(this.docPracShort(id));
    }

    /**
     * Gets a practitioner from the database
     * @param id the id of the practitioner
     */
    public async GetPractitioner(id: string) {
        const pracDoc = await getDoc(this.docPracShort(id));
        if (!pracDoc.exists())
            return Promise.reject();
        let practitioner: Practitioner = pracDoc.data() as Practitioner;
        practitioner.thisObjectID = pracDoc.id;
        return Promise.resolve(practitioner);
    }

    /**
     * Gets a practitioner from cache
     * @param id the id of the practitioner
     */
    public async GetPractitionerFromCache(id: string) {
        try {
            const pracDoc = await getDocFromCache(this.docPracShort(id));
            if (!pracDoc.exists())
                return Promise.reject();
            let practitioner: Practitioner = pracDoc.data() as Practitioner;
            practitioner.thisObjectID = pracDoc.id;
            return Promise.resolve(practitioner);
        } catch (exception) {
            return Promise.reject();
        }
    }

    /**
     * Gets all the exercises of a practitioner
     * @param id the id of the array of exercises (aka practitioner.exercisesID)
     * @param fromCache if the doc should be loaded from cache or not
     */
    public async GetPractitionersExercises(id: string, fromCache: boolean = false) {
        try {
            const doc = fromCache ? await getDocFromCache(this.docExerShort(id)) : await getDoc(this.docExerShort(id));
            if (!doc.exists())
                return Promise.reject();
            let exercises: Exercise[] = (doc.data() as { items: Exercise[] }).items;
            for (let i = 0; i < exercises.length; i++) {
                let errorOccurred = false;
                await this.exercisesService.GetExerciseFromCache(exercises[i].exerciseID).then(value => exercises[i].exercise = value).catch(() => errorOccurred = true);
                if (errorOccurred)
                    exercises[i].exercise = await this.exercisesService.GetExercise(exercises[i].exerciseID);
            }
            return Promise.resolve(exercises);
        } catch (exception) {
            return Promise.reject();
        }
    }

    /**
     * Gets all the presences of a practitioner
     * @param id the id of the array of presences (aka practitioner.presenceLogID)
     * @param fromCache if the doc should be loaded from cache or not
     */
    public async GetPractitionersPresences(id: string, fromCache: boolean = false) {
        try {
            const doc = fromCache ? await getDocFromCache(this.docPresShort(id)) : await getDoc(this.docPresShort(id));
            if (!doc.exists())
                return Promise.reject();
            let data = (doc.data() as { items: { date: number, wasPresent: boolean }[] }).items
            let presences: Presence[] = [];
            for (let i = 0; i < data.length; i++)
                presences.push({date: new Date(data[i].date), wasPresent: data[i].wasPresent});
            return Promise.resolve(presences);
        } catch (exception) {
            return Promise.reject();
        }
    }

    /**
     * Gets a practitioner with all the fields filled (including the exercise and presence array)
     * @param id the id of the practitioner
     */
    public async GetPractitionerAllFieldsFilled(id: string) {
        const pracDoc = await getDoc(this.docPracShort(id));
        if (!pracDoc.exists())
            return Promise.reject();
        let practitioner = pracDoc.data() as Practitioner;
        const ExerDoc = await getDoc(this.docExerShort(practitioner.exercisesID));
        practitioner.exercises = await this.GetPractitionersExercises(practitioner.exercisesID);
        practitioner.presenceLog = await this.GetPractitionersPresences(practitioner.presenceLogID);
        return Promise.resolve(practitioner);
    }

    /**
     * Gets all the practitioner, without any optional fields being filled
     */
    public async GetAllFromRange(from: number, to: number) {
        const allDocs = await getDocs(query(this.colPracShort(), startAt(from), endAt(to)));
        let arrayOfPractitioner: (Practitioner)[] = [];
        allDocs.forEach(doc => {
            let practitioner: Practitioner = doc.data() as Practitioner;
            practitioner.thisObjectID = doc.id;
            arrayOfPractitioner.push(practitioner)
        });
        return arrayOfPractitioner;
    }

    /**
     * Gets all practitioners, without any optional fields being filled
     * @param maxEntries (optional) the total amount of entries to fetch
     */
    public async GetAllPractitioners(maxEntries?: number) {
        const allDocs = (maxEntries && maxEntries > 0) ? await getDocs(query(this.colPracShort(), limit(maxEntries))) : await getDocs(this.colPracShort());
        let arrayOfPractitioner: (Practitioner)[] = [];
        allDocs.forEach(doc => {
            let practitioner: Practitioner = doc.data() as Practitioner;
            practitioner.thisObjectID = doc.id;
            arrayOfPractitioner.push(practitioner)
        });
        return arrayOfPractitioner;
    }

    /**
     * Gets all practitioners, without any optional fields being filled
     * @param maxEntries (optional) the total amount of entries to fetch
     */
    public async GetAllPractitionersFromCache(maxEntries?: number) {
        try {
            const allDocs = (maxEntries && maxEntries > 0) ? await getDocsFromCache(query(this.colPracShort(), limit(maxEntries))) : await getDocsFromCache(this.colPracShort());
            let arrayOfPractitioner: (Practitioner)[] = [];
            allDocs.forEach(doc => {
                let practitioner: Practitioner = doc.data() as Practitioner;
                practitioner.thisObjectID = doc.id;
                arrayOfPractitioner.push(practitioner)
            });
            return arrayOfPractitioner;
        } catch (exception){
            return [];
        }
    }
}
