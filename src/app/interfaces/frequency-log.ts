export interface FrequencyLog {
    days: Day[];
}

export interface Day{
    date: Date;
    wasPresent: boolean;
}
