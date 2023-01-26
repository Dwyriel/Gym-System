export interface ExerciseTemplate {
    thisObjectID? :string;
    category: string;
    name: string;
}

export interface Exercise {
    exerciseID: string;
    exercise?: ExerciseTemplate;
    series: number;
    repetition: number;
    rest: number;
    load: number;
}