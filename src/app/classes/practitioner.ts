import {PractitionerExercise} from "../interfaces/exercise";
import {Presence} from "../interfaces/frequency-log";

export class Practitioner {
    thisObjectID?: string;
    formCreationDate: Date = new Date(Date.now());
    name: string = "";
    objectives: string = "";
    observations: string = "";
    exercisesID: string = "";
    exercises?: PractitionerExercise[];
    presenceLogID: string = "";
    presenceLog?: Presence[];
    templateName?: string = "";
}
