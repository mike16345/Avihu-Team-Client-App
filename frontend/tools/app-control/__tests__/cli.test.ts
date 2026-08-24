import { describe, expect, it } from "vitest";
import { formatDryRun } from "../dryRun";
import type { CommandSpec } from "../types";

describe("formatDryRun", () => {
  it("shows preflight and EAS build steps in execution order", () => {
    const spec: CommandSpec = {
      command: "npx",
      args: ["--yes", "eas-cli@16.27.0", "build", "--platform", "android", "--profile", "preview"],
      env: { APP_TENANT: "avihu", APP_ENV: "preview" },
      label: "Build Elevate Coach (preview) for android",
      prerequisite: {
        command: "npm",
        args: ["run", "preflight:eas"],
        env: { APP_TENANT: "avihu", APP_ENV: "preview" },
        label: "EAS preflight for Elevate Coach (preview)",
      },
    };

    expect(formatDryRun(spec)).toBe(
      "Dry run 1/2: APP_TENANT=avihu APP_ENV=preview npm run preflight:eas\n" +
        "Dry run 2/2: APP_TENANT=avihu APP_ENV=preview npx --yes eas-cli@16.27.0 build --platform android --profile preview"
    );
  });
});
