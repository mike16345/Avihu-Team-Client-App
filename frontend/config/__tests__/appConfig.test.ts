import type { ConfigContext } from "@expo/config";
import { afterEach, describe, expect, it, vi } from "vitest";
import createAppConfig from "../../app.config";

const context = { config: {} } as ConfigContext;

describe("app.config Expo owner", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses avihuteam by default and accepts an EXPO_OWNER override", () => {
    vi.stubEnv("APP_TENANT", "avihu");
    vi.stubEnv("APP_ENV", "development");
    vi.stubEnv("EXPO_OWNER", "converted-organization");
    expect(createAppConfig(context).owner).toBe("converted-organization");

    vi.stubEnv("EXPO_OWNER", "");
    expect(createAppConfig(context).owner).toBe("avihuteam");
  });
});
