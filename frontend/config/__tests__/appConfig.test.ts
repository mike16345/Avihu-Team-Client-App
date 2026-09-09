import type { ConfigContext } from "@expo/config";
import { afterEach, describe, expect, it, vi } from "vitest";
import createAppConfig from "../../app.config";
import easConfig from "../../eas.json";

const context = { config: {} } as ConfigContext;

describe("app.config Expo owner", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the Avihu organization by default", () => {
    vi.stubEnv("APP_TENANT", "avihu");
    vi.stubEnv("APP_ENV", "development");
    vi.stubEnv("EXPO_OWNER", "");
    expect(createAppConfig(context).owner).toBe("avihuteam");
  });

  it("sets the Avihu tenant explicitly on every EAS cloud build profile", () => {
    expect(easConfig.build.development.env.APP_TENANT).toBe("avihu");
    expect(easConfig.build.preview.env.APP_TENANT).toBe("avihu");
    expect(easConfig.build.production.env.APP_TENANT).toBe("avihu");
    expect(easConfig.build["development-simulator"].extends).toBe("development");
  });
});
