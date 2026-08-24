import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { createCleanPrebuildCheck } from "../checks/androidRelease";
import { createSmokeInfrastructureCheck } from "../checks/artifacts";
import { createFastSuite } from "../suites";
import type { ProcessPreflightContext, ProcessSpec } from "../processCheck";

const roots: string[] = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true }))));

const createContext = async (
  runner: ProcessPreflightContext["runner"]
): Promise<ProcessPreflightContext> => {
  const projectRoot = await mkdtemp(path.join(tmpdir(), "preflight-round2-"));
  roots.push(projectRoot);
  return {
    tenant: "avihu",
    environment: "development",
    projectRoot,
    processEnv: {},
    platform: "linux",
    timestamp: "2026-08-24T02:00:00.000Z",
    tenantConfig: { platforms: ["ios", "android"] } as never,
    expoConfig: {} as never,
    runner,
  };
};

const doctorOutput = (categoryLines: string[]) =>
  [
    "Running 18 checks on your project...",
    "17/18 checks passed. 1 checks failed. Possible issues detected:",
    "✖ Validate packages against React Native Directory package metadata",
    "The following issues were found when validating your dependencies:",
    ...Array.from({ length: 10 }, (_, index) => `context line ${index + 1}`),
    ...categoryLines,
    "Advice:",
    "Review package compatibility.",
  ].join("\n");

const baselineCategories = [
  "  Untested on New Architecture: react-native-health, react-native-infinite-wheel-picker",
  "  Unmaintained: expo-health-connect, react-native-infinite-wheel-picker",
];

describe("strict Expo Doctor classification", () => {
  it.each([
    ["an extra category", [...baselineCategories, "  Deprecated: extra-package"]],
    ["a duplicate category", [...baselineCategories, baselineCategories[0]]],
    ["a second failure block", [...baselineCategories, "✖ Validate Expo configuration"]],
    [
      "a duplicate package",
      [`${baselineCategories[0]}, react-native-health`, baselineCategories[1]],
    ],
    [
      "an extra package beyond report evidence",
      [
        baselineCategories[0],
        `${baselineCategories[1]}, extra-package-after-the-former-eight-line-boundary`,
      ],
    ],
  ])("keeps %s blocking", async (_label, categories) => {
    const context = await createContext(async () => ({
      exitCode: 1,
      stdout: doctorOutput(categories),
      stderr: "1 check failed, indicating possible issues with the project.",
    }));
    const doctor = createFastSuite(context).find(
      (definition) => typeof definition !== "function" && definition.check === "expo.doctor"
    );
    expect(doctor && typeof doctor !== "function" ? await doctor.run(context) : null).toMatchObject(
      { status: "fail", check: "expo.doctor" }
    );
  });

  it("keeps an otherwise acknowledged result blocking when process capture was truncated", async () => {
    const context = await createContext(async () => ({
      exitCode: 1,
      stdout: doctorOutput(baselineCategories),
      stderr: "1 check failed, indicating possible issues with the project.",
      outputTruncated: true,
    }));
    const doctor = createFastSuite(context).find(
      (definition) => typeof definition !== "function" && definition.check === "expo.doctor"
    );
    expect(doctor && typeof doctor !== "function" ? await doctor.run(context) : null).toMatchObject(
      { status: "fail", check: "expo.doctor" }
    );
  });
});

describe("configured smoke redaction", () => {
  it("redacts echoed configured arguments while preserving useful diagnostics", async () => {
    const secrets = ["--credential", "credential-value", "-x", "short-value", "positional-value"];
    const context = await createContext(async () => ({
      exitCode: 1,
      stdout: `diagnostic: connection failed; echoed ${secrets.join(" ")}`,
      stderr: `retry rejected ${secrets.join(" ")}`,
    }));
    context.smokeCommand = { command: "private-smoke-tool", args: secrets };
    const result = await createSmokeInfrastructureCheck(async () => ({
      status: "pass",
      check: "artifacts.release",
      summary: "ready",
    })).run(context);
    const log = await readFile(
      path.join(
        context.projectRoot,
        ".preflight",
        "2026-08-24T02-00-00-000Z",
        "smoke.infrastructure.log"
      ),
      "utf8"
    );
    const published = `${JSON.stringify(result)}\n${log}`;
    for (const secret of ["private-smoke-tool", ...secrets]) {
      expect(published).not.toContain(secret);
    }
    expect(published).toContain("diagnostic: connection failed");
  });
});

describe("platform-specific clean prebuild", () => {
  it.each([
    [["ios"] as const, "ios"],
    [["android"] as const, "android"],
    [["ios", "android"] as const, "all"],
  ])("passes the selected platform to Expo for %j", async (platforms, expected) => {
    const calls: ProcessSpec[] = [];
    const context = await createContext(async (spec) => {
      calls.push(spec);
      return { exitCode: 0, stdout: "", stderr: "" };
    });
    await createCleanPrebuildCheck(platforms).run(context);
    expect(calls[0]?.args).toEqual([
      "expo",
      "prebuild",
      "--clean",
      "--no-install",
      "--platform",
      expected,
    ]);
  });
});
