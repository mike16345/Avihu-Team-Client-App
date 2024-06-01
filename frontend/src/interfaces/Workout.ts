import { WorkoutType } from "@/enums/WorkoutTypes";

export interface ISet {
  minReps: number;
  maxReps?: number;
  restTime: number;
}

export interface IWorkout {
  id: string;
  tipFromTrainer?: string;
  linkToVideo?: string;
  name: string;
  sets: ISet[];
}

export interface IWorkoutPlan {
  id: string;
  workouts: string[];
}

export interface IDetailedWorkoutPlan extends IWorkoutPlan {
  [WorkoutType.CHEST]: IWorkoutPlan[];
  [WorkoutType.LEGS]: IWorkout[];
  [WorkoutType.BICEPS]?: IWorkout[];
  [WorkoutType.BACK]?: IWorkout[];
  [WorkoutType.SHOULDERS]?: IWorkout[];
  [WorkoutType.TRICEPS]?: IWorkout[];
  [WorkoutType.ABS]?: IWorkout[];
  [WorkoutType.CARDIO]?: IWorkout[];
}

export interface ICompletedSet {
  repsDone: number;
  weight: number;
  setTime: number;
}

export interface WeightWorkout extends IWorkout {
  sets: ISet[];
}

export interface CardioWorkout extends IWorkout {
  cardioType: "run" | "walk" | "stairmaster" | string;
}

export interface RecordedWorkout {
  id: string;
  workoutId: string;
  time: number;
  note: string;
}

export interface IRecordedSet {
  repsDone: number;
  weight: number;
  note: string;
}
