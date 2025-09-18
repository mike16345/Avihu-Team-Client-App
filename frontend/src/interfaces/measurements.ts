export interface IMuscleMeasurement {
  _id?: string;
  date: string;
  chest: number;
  arm: number;
  waist: number;
  glutes: number;
  thigh: number;
  calf: number;
}

export interface IUserMuscleMeasurements {
  _id?: string;
  userId: string;
  measurements: IMuscleMeasurement[];
}
