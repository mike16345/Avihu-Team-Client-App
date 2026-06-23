import { describe, expect, it } from "vitest";
import { shouldForceLogout } from "@/services/authErrors";

describe("shouldForceLogout", () => {
  it("returns true for 401 logout-triggering auth codes", () => {
    expect(
      shouldForceLogout({
        response: {
          status: 401,
          data: {
            code: "TOKEN_EXPIRED",
          },
        },
      })
    ).toBe(true);
  });

  it("returns true for 403 logout-triggering auth codes", () => {
    expect(
      shouldForceLogout({
        response: {
          status: 403,
          data: {
            code: "ACCESS_REVOKED",
          },
        },
      })
    ).toBe(true);
  });

  it("returns false for OTP and login validation failures", () => {
    expect(
      shouldForceLogout({
        response: {
          status: 401,
          data: {
            code: "OTP_INVALID",
          },
        },
      })
    ).toBe(false);

    expect(
      shouldForceLogout({
        response: {
          status: 401,
          data: {
            code: "INVALID_CREDENTIALS",
          },
        },
      })
    ).toBe(false);
  });

  it("returns false when the status is not auth-related", () => {
    expect(
      shouldForceLogout({
        response: {
          status: 404,
          data: {
            code: "USER_NOT_FOUND",
          },
        },
      })
    ).toBe(false);
  });

  it("returns false when the response has no code", () => {
    expect(
      shouldForceLogout({
        response: {
          status: 401,
          data: {},
        },
      })
    ).toBe(false);
  });
});
