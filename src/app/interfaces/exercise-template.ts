import {Exercise} from "./exercise";

export interface ExerciseTemplate {
    thisObjectID?: string;
    name: string;
    exerciseIDs: string[];
    exercises?: Exercise[];
}
