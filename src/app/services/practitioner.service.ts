import {Injectable} from '@angular/core';
import {addDoc, arrayUnion, collection, deleteDoc, doc, docData, Firestore, getDoc, getDocs, updateDoc} from "@angular/fire/firestore";
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
        const freqRef = await addDoc(this.colFreqShort(), {items: []});
        const ref = await addDoc(this.colPracShort(), {
            formCreationDate: practitioner.formCreationDate.getTime(),
            name: practitioner.name,
            objectives: practitioner.objectives,
            observations: practitioner.observations,
            exercisesID: exerRef.id,
            presenceLogID: freqRef.id
        });
        return ref.id;
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
     * Updates an existing practitioner's exercise array on the database.
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
     * Updates an existing practitioner's presence array on the database.
     * @param id the id of the array of presence (aka practitioner.presenceLogID)
     * @param presence the presence that will be added
     */
    public async AddPresence(id: string, presence: Presence) {
        return updateDoc(this.docPresShort(id), {items: arrayUnion(presence)});
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

    public async GetPractitioner(id: string) {
        const pracDoc = await getDoc(this.docPracShort(id));
        if (!pracDoc.exists())
            return Promise.reject();
        let practitioner: Practitioner = pracDoc.data() as Practitioner;
        practitioner.thisObjectID = pracDoc.id;
        return Promise.resolve(practitioner);
    }

    public async GetPractitionersExercises(id: string) {
        const doc = await getDoc(this.docExerShort(id));
        if (!doc.exists())
            return Promise.reject();
        let exercises: Exercise[] = (doc.data() as { items: Exercise[] }).items;
        for (let i = 0; i < exercises.length; i++)
            exercises[i].exercise = await this.exercisesService.GetExercise(exercises[i].exerciseID);
        return Promise.resolve(exercises);
    }

    public async GetPractitionersPresences(id: string) {
        const doc = await getDoc(this.docPresShort(id));
        if (!doc.exists())
            return Promise.reject();
        return Promise.resolve((doc.data() as { items: Presence[] }).items);
    }

    public async GetPractitionerAllFieldsFilled(id: string) {
        const pracDoc = await getDoc(this.docPracShort(id));
        if (!pracDoc.exists())
            return Promise.reject();
        let practitioner = pracDoc.data() as Practitioner;
        const ExerDoc = await getDoc(this.docExerShort(practitioner.exercisesID));
        practitioner.exercises = (ExerDoc.data() as { items: Exercise[] }).items;
        for (let i = 0; i < practitioner.exercises.length; i++)
            practitioner.exercises[i].exercise = await this.exercisesService.GetExercise(practitioner.exercises[i].exerciseID);
        const PresDoc = await getDoc(this.docPresShort(practitioner.presenceLogID));
        practitioner.presenceLog = (PresDoc.data() as { items: Presence[] }).items;
        return Promise.resolve(practitioner);
    }

    public async GetAllPractitioners() {
        const allDocs = await getDocs(this.colPracShort());
        let arrayOfPractitioner: (Practitioner)[] = [];
        allDocs.forEach(doc => {
            let practitioner: Practitioner = doc.data() as Practitioner;
            practitioner.thisObjectID = doc.id;
            arrayOfPractitioner.push(practitioner)
        });
        return arrayOfPractitioner;
    }
}
