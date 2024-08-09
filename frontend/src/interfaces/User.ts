export interface IUser {
  _id: string;
  name: string;
  email: string;
}

// WeighIn interface
export interface IWeighInPost extends Omit<IWeighIn, "date"> {}
export interface IWeighIn {
  _id: string;
  date: Date;
  weight: number;
}

export interface IWeighInResponse {
  _id: string;
  userId: string;
  weighIns: IWeighIn[];
}
