export interface IUser {
  _id: string;
  name: string;
  email: string;
  checkInAt: number;
  imagesUploaded: boolean;
}

// WeighIn interface
export interface IWeighInPost extends Partial<IWeighIn> {}
export interface IWeighIn {
  _id: string;
  date: string;
  weight: number;
}

export interface IWeighInResponse {
  _id: string;
  userId: string;
  weighIns: IWeighIn[];
}
