import {Injectable} from '@angular/core';
import {Firestore, QuerySnapshot, addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, endAt, getDoc, getDocFromCache, getDocs, getDocsFromCache, limit, query, startAt, updateDoc, getCountFromServer} from "@angular/fire/firestore";
import {Practitioner} from "../classes/practitioner";
import {PractitionerExercise} from "../interfaces/exercise";
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

    private getArrayOfPractitionerFromAllDocs(allDocs: QuerySnapshot) {
        let arrayOfPractitioner: (Practitioner)[] = [];
        allDocs.forEach(doc => {
            let practitioner: Practitioner = doc.data() as Practitioner;
            practitioner.thisObjectID = doc.id;
            practitioner.formCreationDate = new Date(practitioner.formCreationDate);
            arrayOfPractitioner.push(practitioner)
        });
        return arrayOfPractitioner;
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
            formCreationDate: new Date().getTime(),
            name: practitioner.name.trim(),
            objectives: practitioner.objectives.trim(),
            observations: practitioner.observations.trim(),
            exercisesID: exerRef.id,
            presenceLogID: presRef.id
        });
    }

    /**
     * Updates an existing practitioner on the database.
     * @param id the id of the practitioner to be modified
     * @param practitioner the modifications that will be performed
     */
    public async UpdatePractitioner(id: string, practitioner: { name?: string, objectives?: string, observations?: string, templateName?: string }) {
        let obj: any = {};
        if (practitioner.name)
            obj["name"] = practitioner.name.trim();
        if (practitioner.objectives)
            obj["objectives"] = practitioner.objectives.trim();
        if (practitioner.observations)
            obj["observations"] = practitioner.observations.trim();
        if (practitioner.templateName || practitioner.templateName === "")
            obj["templateName"] = practitioner.templateName.trim();
        if (Object.keys(obj).length < 1)
            return;
        return updateDoc(this.docPracShort(id), obj);
    }

    /**
     * Updates an existing practitioner's exercise array on the database, adding a new entry.
     * @param id the id of the array of exercises (aka practitioner.exercisesID)
     * @param exercises the exercises that will be added
     */
    public async AddExercise(id: string, ...exercises: PractitionerExercise[]) {
        if (exercises.length < 1)
            return;
        let exercisesToSend: PractitionerExercise[] = [];
        for (let exercise of exercises)
            exercisesToSend.push({exerciseID: exercise.exerciseID, series: exercise.series, repetition: exercise.repetition, rest: exercise.rest, load: exercise.load});
        return updateDoc(this.docExerShort(id), {
            items: arrayUnion(...exercisesToSend)
        });
    }

    /**
     * Updates an existing practitioner's presence array on the database, adding a new entry. time will always be changed to 12pm before running the query.
     * @param id the id of the array of presences (aka practitioner.presenceLogID)
     * @param presences the presences that will be added
     */
    public async AddPresence(id: string, ...presences: Presence[]) {
        if (presences.length < 1)
            return;
        let presencesToSend: { date: number, wasPresent: boolean }[] = [];
        for (let presence of presences) {
            presence.date.setHours(12, 0, 0);
            presencesToSend.push({date: presence.date.getTime(), wasPresent: presence.wasPresent})
        }
        return updateDoc(this.docPresShort(id), {
            items: arrayUnion(...presencesToSend)
        });
    }

    /**
     * Removes an exercise from a practitioner's exercise array.
     * @param id the id of the array of exercises (aka practitioner.exercisesID)
     * @param exercises the exercises that will be removed
     */
    public async RemoveExercise(id: string, ...exercises: PractitionerExercise[]) {
        if (exercises.length < 1)
            return;
        let exercisesToSend: PractitionerExercise[] = [];
        for (let exercise of exercises)
            exercisesToSend.push({exerciseID: exercise.exerciseID, series: exercise.series, repetition: exercise.repetition, rest: exercise.rest, load: exercise.load});
        return updateDoc(this.docExerShort(id), {
            items: arrayRemove(...exercisesToSend)
        });
    }

    /**
     * Removes a presence from a practitioner's presence array.
     * @param id the id of the array of presences (aka practitioner.presenceLogID)
     * @param presences the presences that will be removed
     */
    public async RemovePresence(id: string, ...presences: Presence[]) {
        if (presences.length < 1)
            return;
        let presencesToSend: { date: number, wasPresent: boolean }[] = [];
        for (let presence of presences) {
            presence.date.setHours(12, 0, 0);
            presencesToSend.push({date: presence.date.getTime(), wasPresent: presence.wasPresent})
        }
        return updateDoc(this.docPresShort(id), {
            items: arrayRemove(...presencesToSend)
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
     * @throws if doc doesn't exist, returning {docDoesNotExist: true}
     */
    public async GetPractitioner(id: string) {
        const pracDoc = await getDoc(this.docPracShort(id));
        if (!pracDoc.exists())
            return Promise.reject({docDoesNotExist: true});
        let practitioner: Practitioner = pracDoc.data() as Practitioner;
        practitioner.thisObjectID = pracDoc.id;
        practitioner.formCreationDate = new Date(practitioner.formCreationDate);
        return Promise.resolve(practitioner);
    }

    /**
     * Gets a practitioner from cache
     * @param id the id of the practitioner
     * @throws if doc doesn't exist, returning {docDoesNotExist: true}
     */
    public async GetPractitionerFromCache(id: string) {
        try {
            const pracDoc = await getDocFromCache(this.docPracShort(id));
            if (!pracDoc.exists())
                return Promise.reject({docDoesNotExist: true});
            let practitioner: Practitioner = pracDoc.data() as Practitioner;
            practitioner.thisObjectID = pracDoc.id;
            practitioner.formCreationDate = new Date(practitioner.formCreationDate);
            return Promise.resolve(practitioner);
        } catch (exception) {
            return Promise.reject();
        }
    }

    /**
     * Gets all the exercises of a practitioner
     * @param id the id of the array of exercises (aka practitioner.exercisesID)
     * @param fromCache if the doc should be loaded from cache or not
     * @throws if doc doesn't exist, returning {docDoesNotExist: true}
     */
    public async GetPractitionersExercises(id: string, fromCache: boolean = false) {
        try {
            const doc = fromCache ? await getDocFromCache(this.docExerShort(id)) : await getDoc(this.docExerShort(id));
            if (!doc.exists())
                return Promise.reject({docDoesNotExist: true});
            let exercises: PractitionerExercise[] = (doc.data() as { items: PractitionerExercise[] }).items;
            for (let i = 0; i < exercises.length; i++) {
                let cacheError = false, errorOccurred = false;
                await this.exercisesService.GetExerciseFromCache(exercises[i].exerciseID).then(value => exercises[i].exercise = value).catch(() => cacheError = true);
                if (cacheError)
                    await this.exercisesService.GetExercise(exercises[i].exerciseID).then(value => exercises[i].exercise = value).catch(() => errorOccurred);
                if (errorOccurred)
                    return Promise.reject();
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
     * @throws if doc doesn't exist, returning {docDoesNotExist: true}
     */
    public async GetPractitionersPresences(id: string, fromCache: boolean = false) {
        try {
            const doc = fromCache ? await getDocFromCache(this.docPresShort(id)) : await getDoc(this.docPresShort(id));
            if (!doc.exists())
                return Promise.reject({docDoesNotExist: true});
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
     * @throws if doc doesn't exist, returning {docDoesNotExist: true}
     */
    public async GetPractitionerAllFieldsFilled(id: string) {
        const pracDoc = await getDoc(this.docPracShort(id));
        if (!pracDoc.exists())
            return Promise.reject({docDoesNotExist: true});
        let practitioner = pracDoc.data() as Practitioner;
        practitioner.thisObjectID = pracDoc.id;
        practitioner.formCreationDate = new Date(practitioner.formCreationDate);
        practitioner.exercises = await this.GetPractitionersExercises(practitioner.exercisesID);
        practitioner.presenceLog = await this.GetPractitionersPresences(practitioner.presenceLogID);
        return Promise.resolve(practitioner);
    }

    /**
     * Gets all the practitioner, without any optional fields being filled
     */
    public async GetAllPractitionersFromRange(from: number, to: number) {
        const allDocs = await getDocs(query(this.colPracShort(), startAt(from), endAt(to)));
        return this.getArrayOfPractitionerFromAllDocs(allDocs);
    }

    /**
     * Gets all practitioners, without any optional fields being filled
     * @param maxEntries (optional) the total amount of entries to fetch
     */
    public async GetAllPractitioners(maxEntries?: number) {
        const allDocs = (maxEntries && maxEntries > 0) ? await getDocs(query(this.colPracShort(), limit(maxEntries))) : await getDocs(this.colPracShort());
        return this.getArrayOfPractitionerFromAllDocs(allDocs);
    }

    /**
     * Gets all practitioners, without any optional fields being filled
     * @param maxEntries (optional) the total amount of entries to fetch
     */
    public async GetAllPractitionersFromCache(maxEntries?: number) {
        try {
            const allDocs = (maxEntries && maxEntries > 0) ? await getDocsFromCache(query(this.colPracShort(), limit(maxEntries))) : await getDocsFromCache(this.colPracShort());
            return this.getArrayOfPractitionerFromAllDocs(allDocs);
        } catch (exception) {
            return Promise.reject();
        }
    }

    /**
     * Gets the amount of practitioner docs currently created.
     */
    public async GetPractitionerCount() {
        try {
            const doc = await getCountFromServer(this.colPracShort());
            return doc.data().count;
        } catch (exception) {
            return Promise.reject();
        }
    }

}
