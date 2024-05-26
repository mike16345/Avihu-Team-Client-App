import { WeightUnit } from "../types/weightTypes";

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string; // just for demo
  dietPlan: string;
  workoutPlan: string;
  weighIns: string[];
  workoutProgress: string[];
  mealsProgress: string[];
}

// WeighIn interface
export interface IWeighIn {
  id?: string;
  date: Date;
  weight: number;
  weightUnit: WeightUnit;
}
