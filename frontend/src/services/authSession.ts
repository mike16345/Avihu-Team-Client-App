import AsyncStorage from "@react-native-async-storage/async-storage";
import { SESSION_TOKEN_KEY } from "@/constants/reactQuery";
import {
  AuthSessionSnapshot,
  LoginResponse,
  PersistedAuthSession,
  RefreshResponse,
  SafeAuthUser,
} from "@/interfaces/IAuth";

type StoredAuthSession = PersistedAuthSession & {
  accessToken?: string;
};

type AuthSessionListener = (snapshot: AuthSessionSnapshot | null) => void;

let accessToken: string | undefined;
let refreshToken: string | undefined;
let sessionId: string | undefined;
let user: SafeAuthUser | undefined;
const listeners = new Set<AuthSessionListener>();

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const hasStringField = (value: Record<string, unknown>, key: string): boolean => {
  return typeof value[key] === "string";
};

const hasOptionalStringField = (value: Record<string, unknown>, key: string): boolean => {
  return value[key] === undefined || typeof value[key] === "string";
};

const isSafeAuthUser = (value: unknown): value is SafeAuthUser => {
  if (!isRecord(value)) return false;

  return hasStringField(value, "_id") && hasStringField(value, "email");
};

const isStoredAuthSession = (value: unknown): value is StoredAuthSession => {
  if (!isRecord(value)) return false;

  const isVersionOne = value.version === 1;
  const hasAccessToken = hasOptionalStringField(value, "accessToken");
  const hasRefreshToken = hasStringField(value, "refreshToken");
  const hasValidSessionId = hasOptionalStringField(value, "sessionId");
  const hasValidUser = value.user === undefined || isSafeAuthUser(value.user);

  return isVersionOne && hasAccessToken && hasRefreshToken && hasValidSessionId && hasValidUser;
};

const extractLegacySession = (value: Record<string, unknown>): StoredAuthSession | null => {
  const nestedValue = isRecord(value.data) ? value.data : value;

  if (!isRecord(nestedValue)) return null;

  const nestedUser = isRecord(nestedValue.user)
    ? nestedValue.user
    : isRecord(nestedValue.data)
      ? nestedValue.data.user
      : undefined;

  if (!hasStringField(nestedValue, "refreshToken")) return null;

  const nextUser = isSafeAuthUser(nestedUser) ? nestedUser : undefined;

  return {
    version: 1,
    accessToken: typeof nestedValue.accessToken === "string" ? nestedValue.accessToken : undefined,
    refreshToken: nestedValue.refreshToken as string,
    sessionId: typeof nestedValue.sessionId === "string" ? nestedValue.sessionId : undefined,
    user: nextUser,
  };
};

const parsePersistedAuthSession = (value: unknown): StoredAuthSession | null => {
  if (typeof value === "string") {
    try {
      return parsePersistedAuthSession(JSON.parse(value));
    } catch {
      return null;
    }
  }

  if (isStoredAuthSession(value)) {
    return value;
  }

  if (isRecord(value)) {
    return extractLegacySession(value);
  }

  return null;
};

const persistSession = async () => {
  if (!refreshToken) {
    await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
    return;
  }

  const session = {
    version: 1,
    accessToken,
    refreshToken,
    sessionId,
    user,
  } satisfies StoredAuthSession;

  await AsyncStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(session));
};

const emitAuthSessionChange = () => {
  const snapshot = getAuthSessionSnapshot();

  listeners.forEach((listener) => listener(snapshot));
};

export const loadPersistedAuthSession = async () => {
  const rawSession = await AsyncStorage.getItem(SESSION_TOKEN_KEY);

  if (!rawSession) {
    return null;
  }

  const persistedSession = parsePersistedAuthSession(rawSession);

  if (!persistedSession) {
    await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
    return null;
  }

  accessToken = persistedSession.accessToken;
  refreshToken = persistedSession.refreshToken;
  sessionId = persistedSession.sessionId;
  user = persistedSession.user;

  return getAuthSessionSnapshot();
};

export const getAuthSessionSnapshot = (): AuthSessionSnapshot | null => {
  if (!refreshToken && !accessToken) {
    return null;
  }

  return {
    version: 1,
    accessToken,
    refreshToken: refreshToken ?? "",
    sessionId,
    user,
  };
};

export const getAccessToken = () => accessToken;

export const getRefreshToken = () => refreshToken;

export const setAuthSession = async ({
  nextAccessToken,
  nextRefreshToken,
  nextSessionId,
  nextUser,
}: {
  nextAccessToken?: string;
  nextRefreshToken?: string;
  nextSessionId?: string;
  nextUser?: SafeAuthUser;
}) => {
  accessToken = nextAccessToken ?? accessToken;
  refreshToken = nextRefreshToken ?? refreshToken;
  sessionId = nextSessionId ?? sessionId;
  user = nextUser ?? user;

  await persistSession();
  emitAuthSessionChange();
};

export const setAuthSessionFromLogin = async (session: LoginResponse) => {
  await setAuthSession({
    nextAccessToken: session.accessToken,
    nextRefreshToken: session.refreshToken,
    nextSessionId: session.sessionId,
    nextUser: session.user,
  });
};

export const setAuthSessionFromRefresh = async (session: RefreshResponse) => {
  await setAuthSession({
    nextAccessToken: session.accessToken,
    nextRefreshToken: session.refreshToken,
    nextUser: session.user,
  });
};

export const clearAuthSession = async (notify = true) => {
  accessToken = undefined;
  refreshToken = undefined;
  sessionId = undefined;
  user = undefined;

  await AsyncStorage.removeItem(SESSION_TOKEN_KEY);

  if (notify) {
    emitAuthSessionChange();
  }
};

export const subscribeAuthSession = (listener: AuthSessionListener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
