export type SessionType = "login" | "workout" | string;

export interface ISession extends Document {
  userId: string;
  type: SessionType;
  data?: any; // Additional session-specific data
  createdAt: Date;
  updatedAt: Date;
}
