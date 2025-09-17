import { ISession } from "./ISession";

export interface IWorkout {
  id: string;
  tipFromTrainer?: string;
  linkToVideo?: string;
  exerciseMethod?: string;
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

export interface IExerciseMethod {
  title: string;
  description: string;
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
  _id?: string;
  userId?: string;
  planName: string;
  muscleGroups: IMuscleGroupWorkouts[];
}

export interface ICardioPlan {
  type: `simple` | `complex`;
  plan: IComplexCardioType | ISimpleCardioType;
}

export interface ISimpleCardioType {
  minsPerWeek: number;
  timesPerWeek: number;
  minsPerWorkout?: number;
  tips?: string;
}

export interface ICardioWorkout {
  name: string;
  warmUpAmount?: number;
  distance: string;
  cardioExercise: string;
  tips?: string;
}

export interface ICardioWeek {
  week: string;
  workouts: ICardioWorkout[];
}
export interface IComplexCardioType {
  weeks: ICardioWeek[];
  tips?: string;
}

export interface ICompleteWorkoutPlan {
  userId?: string;
  tips?: string[];
  workoutPlans: IWorkoutPlan[];
  cardio: ICardioPlan;
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
  _id?: string;
  exerciseId: { name: string; linkToVideo: string; _id: string; imageUrl?: string };
  tipFromTrainer?: string;
  exerciseMethod?: string;
  sets: ISet[];
  restTime: number;
}

export interface IMuscleGroupWorkouts {
  muscleGroup: string;
  exercises: IExercise[];
}

export interface IRecordedSet {
  plan: string;
  weight: number;
  repsDone: number;
  setNumber: number;
  date: Date;
  note: string;
}

export interface ICardioExerciseItem {
  name: string;
}

export interface IExerciseRecordedSets {
  [exercise: string]: IRecordedSet[];
}

export interface IMuscleGroupRecordedSets {
  userId: string;
  muscleGroup: string;
  recordedSets: IExerciseRecordedSets;
}
