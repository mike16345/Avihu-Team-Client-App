import { describe, expect, it } from "vitest";
import { resolveAction } from "../actions";

describe("resolveAction", () => {
  it("maps an Avihu production build to the pinned EAS command and child environment", () => {
    expect(
      resolveAction({
        action: "build",
        platform: "android",
        tenantId: "avihu",
        environment: "production",
        profile: "production",
      })
    ).toMatchObject({
      command: "npx",
      args: [
        "--yes",
        "eas-cli@16.27.0",
        "build",
        "--platform",
        "android",
        "--profile",
        "production",
      ],
      env: {
        APP_TENANT: "avihu",
        APP_ENV: "production",
      },
    });
  });

  it("maps fast preflight directly to the shared package script", () => {
    expect(
      resolveAction({
        action: "preflight",
        mode: "fast",
        tenantId: "avihu",
        environment: "development",
      })
    ).toMatchObject({
      command: "npm",
      args: ["run", "preflight"],
      env: {
        APP_TENANT: "avihu",
        APP_ENV: "development",
      },
    });
  });

  it("maps release preflight directly to the shared package script", () => {
    expect(
      resolveAction({
        action: "preflight",
        mode: "release",
        tenantId: "avihu",
        environment: "production",
      })
    ).toMatchObject({
      command: "npm",
      args: ["run", "preflight:release"],
      env: {
        APP_TENANT: "avihu",
        APP_ENV: "production",
      },
    });
  });
});
