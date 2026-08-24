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

  it("keeps future preflight work behind a stable package action name", () => {
    expect(
      resolveAction({
        action: "preflight",
        mode: "fast",
        tenantId: "avihu",
        environment: "development",
      })
    ).toMatchObject({
      command: "npm",
      args: ["run", "preflight:fast"],
      env: {
        APP_TENANT: "avihu",
        APP_ENV: "development",
      },
    });
  });
});
