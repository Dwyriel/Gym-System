export interface ExerciseTemplate {
    category: string;
    name: string;
}

export interface Exercises {
    exerciseID: string;
    exercise?: ExerciseTemplate;
    series: number;
    repetition: number;
    rest: number;
    load: number;
}
