import { ISession } from "./ISession";

export interface IWorkout {
  id: string;
  tipFromTrainer?: string;
  linkToVideo?: string;
  name: string;
  sets: ISet[];
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
  plan: string;
}

export interface IRecordedSetResponse {
  plan: string;
  exercise: string;
  setNumber: number;
  weight: number;
  repsDone: number;
  note: string;
  date: Date;
}

export interface IRecordedSetPost {
  userId: string;
  muscleGroup: string;
  exercise: string;
  recordedSet: IRecordedSet;
}

export interface IWorkoutPlan {
  id?: string;
  userId?: string;
  planName: string;
  muscleGroups: IMuscleGroupWorkouts[];
}

export interface ICompleteWorkoutPlan {
  userId?: string;
  tips?: string[];
  workoutPlans: IWorkoutPlan[];
}

export interface ISet {
  id: number;
  minReps: number;
  maxReps?: number;
}

export interface IRecordedSetResponse {
  session: ISession;
  recordedSet: IRecordedSet;
}

export interface IExercise {
  tipFromTrainer?: string;
  linkToVideo?: string;
  name: string;
  sets: ISet[];
}

export interface IMuscleGroupWorkouts {
  muscleGroup: string;
  exercises: IExercise[];
}
