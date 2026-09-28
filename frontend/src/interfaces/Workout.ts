import { ISession } from "./ISession";

export interface IExerciseMethod {
  title: string;
  description: string;
}

export interface IRecordedSetPost {
  userId: string;
  muscleGroup: string;
  exercise: string;
  recordedSet: IRecordedSet[];
}

export interface IWorkoutPlan {
  _id?: string;
  userId?: string;
  planName: string;
  muscleGroups: IMuscleGroupWorkouts[];
}

export interface ICardioPlan {
  type: `simple` | `complex` | `steps`;
  plan: IComplexCardioType | ISimpleCardioType | IStepsCardioType;
}

export interface ISimpleCardioType {
  minsPerWeek: number;
  timesPerWeek: number;
  minsPerWorkout?: number;
  tips?: string;
}

export interface IStepsCardioType {
  mode: "uniform" | "custom";
  daily: number;
  perDay?: number[];
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

export type WorkoutPlanMode = "unified" | "blocks";

export type WorkoutBlockStatus =
  | "low-intensity"
  | "moderate-intensity"
  | "high-intensity"
  | "peak"
  | "deload";

export type BlockBackgroundStatus = "normal" | WorkoutBlockStatus;

export interface IBlockBackground {
  status: BlockBackgroundStatus;
  url: string;
}

export interface IWorkoutBlock {
  id: string;
  name?: string;
  status?: WorkoutBlockStatus;
  workoutPlans: IWorkoutPlan[];
  tips?: string[];
}

export interface ICompleteWorkoutPlan {
  userId?: string;
  tips?: string[];
  workoutPlans: IWorkoutPlan[];
  cardio: ICardioPlan;
  mode?: WorkoutPlanMode;
  blocks?: IWorkoutBlock[];
  activeBlockIndex?: number;
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
  exerciseId: {
    name: string;
    linkToVideo: string;
    _id: string;
    imageUrl?: string;
    tipFromTrainer?: string;
  };
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
  rir?: number | null;
}

export interface IRecordedSetRes extends IRecordedSet {
  _id: string;
  date: string;
}

export interface ICardioExerciseItem {
  name: string;
}

export interface IExerciseRecordedSets {
  [exercise: string]: IRecordedSetRes[];
}

export interface IMuscleGroupRecordedSets {
  userId: string;
  muscleGroup: string;
  recordedSets: IExerciseRecordedSets;
}
