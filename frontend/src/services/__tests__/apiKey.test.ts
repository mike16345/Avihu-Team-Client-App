import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiKey } from "@/services/apiKey";

describe("getApiKey", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails clearly when the public client key is missing", () => {
    vi.stubEnv("EXPO_PUBLIC_API_AUTH_TOKEN", "");

    expect(() => getApiKey()).toThrowError("EXPO_PUBLIC_API_AUTH_TOKEN is required");
  });

  it("returns the public client key without logging it", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubEnv("EXPO_PUBLIC_API_AUTH_TOKEN", "public-client-key");

    expect(getApiKey()).toBe("public-client-key");
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
