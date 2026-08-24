import { describe, expect, it } from "vitest";
import { EAS_CLI_ARGS, resolveAction } from "../actions";

describe("resolveAction", () => {
  it("builds a pinned EAS command with an explicit tenant environment", () => {
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
        ...EAS_CLI_ARGS,
        "build",
        "--platform",
        "android",
        "--profile",
        "production",
        "--non-interactive",
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
