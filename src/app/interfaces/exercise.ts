export interface Exercise {
    thisObjectID? :string;
    category: string;
    name: string;
}

export interface PractitionerExercise {
    exerciseID: string;
    exercise?: Exercise;
    series: number;
    repetition: number;
    rest: number;
    load: number;
}
