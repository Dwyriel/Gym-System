import {Exercises} from "../interfaces/exercises";
import {Presence} from "../interfaces/frequency-log";

export class Practitioner {
    formCreationDate: Date = new Date(Date.now());
    name: string = "";
    objectives: string = "";
    observations: string = "";
    exercisesID: string = "";
    exercises?: Exercises[];
    frequencyLogID: string = "";
    frequencyLog?: Presence[];
}
