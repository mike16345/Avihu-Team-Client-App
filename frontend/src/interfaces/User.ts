import { WeightUnit } from "@/types/weightTypes";

export interface IUser {
  _id: string;
  name: string;
  email: string;
}

// WeighIn interface
export interface IWeighIn {
  id?: string;
  date: Date;
  weight: number;
  weightUnit: WeightUnit;
}

export interface IWeighInResponse {
  _id: string;
  userId: string;
  weighIns: IWeighIn[];
}
