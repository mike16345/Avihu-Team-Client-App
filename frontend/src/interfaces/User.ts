export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dietaryType: string[];
  dateJoined: Date;
  dateFinished: Date;
  planType: string;
  remindIn: number;
  checkInAt: number;
  imagesUploaded: boolean;
  password?: string;
  hasAccess: boolean;
}

export interface IUserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateJoined: Date;
  dateFinished: Date;
  planType: string;
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
