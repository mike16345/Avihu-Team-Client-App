export const LOGOUT_AUTH_CODES = new Set([
  "TOKEN_EXPIRED",
  "INVALID_TOKEN",
  "SESSION_EXPIRED",
  "SESSION_REVOKED",
  "ACCESS_REVOKED",
  "USER_BLOCKED",
  "USER_NOT_FOUND",
]);

type ApiErrorWithCode = {
  response?: {
    status?: number;
    data?: {
      code?: unknown;
    };
  };
};

export const shouldForceLogout = (error: unknown): boolean => {
  const response = (error as ApiErrorWithCode | undefined)?.response;
  const status = response?.status;
  const code = response?.data?.code;

  if (status !== 401 && status !== 403) {
    return false;
  }

  return typeof code === "string" && LOGOUT_AUTH_CODES.has(code);
};
