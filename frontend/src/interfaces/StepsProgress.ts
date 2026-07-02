export type StepsSyncSource = "healthkit" | "health_connect" | "manual" | "unknown";

export interface StepsSyncPayload {
  date?: string;
  steps: number;
  calories?: number;
  distanceKm?: number;
  dailyGoal?: number;
  source?: StepsSyncSource;
}

export interface IStepsProgress {
  _id?: string;
  userId: string;
  date: string;
  steps: number;
  calories?: number;
  distanceKm?: number;
  dailyGoal?: number;
  source?: StepsSyncSource;
  syncedAt: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
