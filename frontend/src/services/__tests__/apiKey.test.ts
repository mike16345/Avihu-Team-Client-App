import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiKey } from "@/services/apiKey";

const { runtimeExtra } = vi.hoisted(() => ({
  runtimeExtra: {
    tenant: { environment: "development" },
    API_TOKEN: undefined as string | undefined,
  },
}));

vi.mock("expo-constants", () => ({ default: { expoConfig: { extra: runtimeExtra } } }));

describe("getApiKey", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    runtimeExtra.tenant.environment = "development";
    runtimeExtra.API_TOKEN = undefined;
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

  it("uses the production client key from the update manifest", () => {
    runtimeExtra.tenant.environment = "production";
    runtimeExtra.API_TOKEN = "production-client-key";
    vi.stubEnv("EXPO_PUBLIC_API_AUTH_TOKEN", "local-development-key");

    expect(getApiKey()).toBe("production-client-key");
  });

  it("fails clearly when the production client key is missing", () => {
    runtimeExtra.tenant.environment = "production";
    vi.stubEnv("EXPO_PUBLIC_API_AUTH_TOKEN", "local-development-key");

    expect(() => getApiKey()).toThrowError("Production API client key is required");
  });
});
