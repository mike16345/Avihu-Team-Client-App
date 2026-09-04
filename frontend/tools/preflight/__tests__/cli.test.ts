import path from "node:path";
import { describe, expect, it } from "vitest";

import { runPreflightCli } from "../cli";
import { assertPreflightAllowed } from "../cli";
import { avihuTenant } from "../../../config/tenants/avihu";

const projectRoot = path.resolve(import.meta.dirname, "../../..");
const processEnv = {
  EXPO_PUBLIC_API_AUTH_TOKEN: "fixture-token",
  EXPO_PUBLIC_CLOUDFRONT_URL: "https://example.com",
  EXPO_PUBLIC_MODE: "development",
  EXPO_PUBLIC_SERVER: "https://example.com",
  EXPO_PUBLIC_TRAINER_PHONE_NUMBER: "1234",
};

describe("injectable preflight CLI", () => {
  it("rejects direct release and EAS preflight for local tenants", () => {
    const localTenant = { ...avihuTenant, kind: "local" as const, id: "test-tenant" };
    expect(() => assertPreflightAllowed(localTenant, "release")).toThrow(/cannot run release/u);
    expect(() => assertPreflightAllowed(localTenant, "eas")).toThrow(/cannot run eas/u);
    expect(() => assertPreflightAllowed(localTenant, "fast")).not.toThrow();
  });

  it("rejects release preflight for pending repository tenants", () => {
    const pendingTenant = { ...avihuTenant, id: "new-tenant", eas: { status: "pending" as const } };
    expect(() => assertPreflightAllowed(pendingTenant, "release")).toThrow(
      /tenant:eas -- --tenant new-tenant/u
    );
    expect(() => assertPreflightAllowed(pendingTenant, "fast")).not.toThrow();
  });

  it("renders human and JSON from equivalent results and exit behavior", async () => {
    let human = "";
    let json = "";
    const common = {
      projectRoot,
      processEnv,
      platform: "linux" as const,
      runner: async () => ({ exitCode: 0, stdout: "", stderr: "" }),
      now: () => new Date("2026-08-24T00:00:00.000Z"),
    };
    const humanExit = await runPreflightCli({
      ...common,
      argv: ["fast", "--tenant", "avihu", "--environment", "development"],
      writeOutput: (value) => {
        human += value;
      },
    });
    const jsonExit = await runPreflightCli({
      ...common,
      argv: [
        "fast",
        "--tenant",
        "avihu",
        "--environment",
        "development",
        "--json",
        ".preflight/cli-test.json",
      ],
      writeOutput: (value) => {
        json += value;
      },
    });
    const report = JSON.parse(json) as {
      counts: { pass: number; warn: number; fail: number };
      exitCode: number;
    };
    expect(humanExit).toBe(jsonExit);
    expect(report.exitCode).toBe(jsonExit);
    expect(human).toContain(
      `└  ${report.counts.pass} passed · ${report.counts.warn} warning · ${report.counts.fail} failed`
    );
  });
});
