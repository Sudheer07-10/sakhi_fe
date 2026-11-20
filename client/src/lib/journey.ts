export type JourneyStage = 'CONCEPTION_PREP' | 'PREGNANT' | 'PARENT';

export interface JourneyData {
    stage: JourneyStage;
    date?: string; // ISO Date String (LMP, Due Date, or DOB)
    date_type?: string; // 'LMP', 'DUE_DATE', 'BIRTH_DATE', etc.
    lastUpdated: number; // Timestamp
}

export const JOURNEY_STORAGE_KEY = 'janmasethu_journey';

export const JOURNEY_LABELS: Record<JourneyStage, string> = {
    CONCEPTION_PREP: 'Planning & TTC',
    PREGNANT: 'Pregnant',
    PARENT: 'Parent',
};
