export interface IWeeklyFeedbackWorkout {
  planId: string;
  doneSmart: boolean;
  doneManual: boolean;
}

export interface IWeeklyFeedbackWeighIn {
  date: string;
  weight: number;
}

export interface IWeeklyFeedbackNutrition {
  daysCompleted: string[];
  dayNotes: Record<string, string>;
}

export interface IWeeklyFeedbackPayload {
  weekStart: string;
  weekEnd: string;
  workouts: IWeeklyFeedbackWorkout[];
  nutrition: IWeeklyFeedbackNutrition;
  weighIns: IWeeklyFeedbackWeighIn[];
  sleepHours: number | null;
  cardioMinutes?: number | null;
  cardioMinutesGoal?: number | null;
  steps: number | null;
  feedbackText: string;
  finalized: boolean;
}

export interface IWeeklyFeedback extends IWeeklyFeedbackPayload {
  _id: string;
  userId: string;
  submittedAt: string;
  updatedAt: string;
}
