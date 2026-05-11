import { IUser } from "./User";

export type SafeAuthUser = Partial<IUser> & {
  _id: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
  isTrainer: boolean;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  user: SafeAuthUser;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
  user: SafeAuthUser;
};

export type MeResponse = {
  user: SafeAuthUser;
};

export type PersistedAuthSession = {
  version: 1;
  refreshToken: string;
  sessionId?: string;
  user?: SafeAuthUser;
};

export type AuthSessionSnapshot = PersistedAuthSession & {
  accessToken?: string;
};
