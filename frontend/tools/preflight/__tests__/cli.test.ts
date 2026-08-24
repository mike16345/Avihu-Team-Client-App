import path from "node:path";
import { describe, expect, it } from "vitest";

import { runPreflightCli } from "../cli";

const projectRoot = path.resolve(import.meta.dirname, "../../..");
const processEnv = {
  EXPO_PUBLIC_API_AUTH_TOKEN: "fixture-token",
  EXPO_PUBLIC_CLOUDFRONT_URL: "https://example.com",
  EXPO_PUBLIC_MODE: "development",
  EXPO_PUBLIC_SERVER: "https://example.com",
  EXPO_PUBLIC_TRAINER_PHONE_NUMBER: "1234",
};

describe("injectable preflight CLI", () => {
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
    expect(human).toContain(`PASS (${report.counts.pass})`);
    expect(human).toContain(`WARN (${report.counts.warn})`);
    expect(human).toContain(`FAIL (${report.counts.fail})`);
  });
});
