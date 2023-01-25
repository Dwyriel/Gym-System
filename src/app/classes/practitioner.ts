import {Exercise} from "../interfaces/exercise";
import {Presence} from "../interfaces/frequency-log";

export class Practitioner {
    formCreationDate: Date = new Date(Date.now());
    name: string = "";
    objectives: string = "";
    observations: string = "";
    exercisesID: string = "";
    exercises?: Exercise[];
    presenceLogID: string = "";
    presenceLog?: Presence[];
}
