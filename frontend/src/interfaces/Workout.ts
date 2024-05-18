import { WorkoutType } from "../enums/WorkoutTypes";
export interface Workout {
  id: string;
  tipFromTrainer?: string;
  linkToVideo?: string;
  name: string;
  repsToDo: number;
  setsToDo: number;
  restTime: number; // in seconds
}

export interface IWorkoutPlan {
  id: string;
  workouts: string[]; // e.g., "Workout A", "Workout B", "Full Body", etc.
}

export interface IDetailedWorkoutPlan extends IWorkoutPlan {
  [WorkoutType.CHEST]: Record<string, Workout>;
  [WorkoutType.LEGS]: Record<string, Workout>;
  [WorkoutType.BICEPS]?: Record<string, Workout>;
  [WorkoutType.BACK]?: Record<string, Workout>;
  [WorkoutType.SHOULDERS]?: Record<string, Workout>;
  [WorkoutType.TRICEPS]?: Record<string, Workout>;
  [WorkoutType.ABS]?: Record<string, Workout>;
  [WorkoutType.CARDIO]?: Record<string, Workout>;
}

export interface ISet {
  repsDone: number;
  weight: number; // weight used in each set
  setTime: number; // time spent on each set in seconds
}

export interface WeightWorkout extends Workout {
  sets: ISet[];
}

interface CardioWorkout extends Workout {
  cardioType: "run" | "walk" | "stairmaster" | string;
}

export interface RecordedWorkout {
  id: string;
  workoutId: string;
  time: number; // time spent on workout in minutes
  note: string;
}
