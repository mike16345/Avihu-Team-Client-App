export type SessionType = "login" | "workout" | string;

export interface ISession extends Document {
  _id: string;
  userId: string;
  type: SessionType;
  data?: any; // Additional session-specific data
  createdAt: Date;
  updatedAt: Date;
}
