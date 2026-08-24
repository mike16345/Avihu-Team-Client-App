import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { createProcessCheck, type ProcessSpec } from "../processCheck";
import { runChecks } from "../engine";
import { createPreflightContext } from "../contexts";
import { createAndroidReleaseChecks } from "../checks/androidRelease";
import { createEasSuite, createFastSuite, createReleaseSuite } from "../suites";
import type { PreflightSuiteContext } from "../suites";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true })));
});

const createContext = (overrides: Partial<PreflightSuiteContext> = {}): PreflightSuiteContext =>
  ({
    tenant: "avihu",
    environment: "development",
    projectRoot: "/workspace/frontend",
    processEnv: {},
    platform: "linux",
    timestamp: "2026-08-24T00:00:00.000Z",
    tenantConfig: {},
    expoConfig: {},
    runner: async () => ({ exitCode: 0, stdout: "", stderr: "" }),
    ...overrides,
  }) as unknown as PreflightSuiteContext;

const getCheckIds = (suite: ReturnType<typeof createFastSuite>) =>
  suite.map((definition) =>
    typeof definition === "function"
      ? (definition.check ?? definition.id ?? definition.name)
      : definition.check
  );

describe("preflight suite composition", () => {
  it("covers every required fast tenant, project-health, asset, config, and policy check", () => {
    expect(getCheckIds(createFastSuite(createContext()))).toEqual([
      "tenant.config",
      "tenant.environment",
      "project.typescript",
      "tests.unit",
      "dependencies.native-maintenance",
      "expo.install",
      "assets",
      "expo.config",
      "native.drift",
      "android.r8",
      "android.edge-to-edge",
      "android.large-screen-adaptability",
      "ios.platform-policy",
    ]);
  });

  it("makes release a strict ordered superset with native, artifact, export, and smoke checks", () => {
    const context = createContext();
    const fastIds = getCheckIds(createFastSuite(context));
    const releaseIds = getCheckIds(createReleaseSuite(context));

    expect(releaseIds.slice(0, fastIds.length)).toEqual(fastIds);
    expect(new Set(releaseIds).size).toBe(releaseIds.length);
    expect(releaseIds.slice(fastIds.length)).toEqual([
      "native.prebuild",
      "android.lint-release",
      "android.bundle-release",
      "android.aab-validation",
      "javascript.production-export",
      "ios.release-validation",
      "artifacts.release",
      "smoke.infrastructure",
    ]);
  });

  it("keeps EAS non-interactive validation process-safe by composing the fast suite", () => {
    const context = createContext();

    expect(getCheckIds(createEasSuite(context))).toEqual(getCheckIds(createFastSuite(context)));
    expect(getCheckIds(createEasSuite(context))).not.toContain("native.prebuild");
  });

  it("skips macOS-only iOS release validation explicitly on other platforms", async () => {
    const processSpecs: ProcessSpec[] = [];
    const context = createContext({
      platform: "linux",
      runner: async (spec) => {
        processSpecs.push(spec);
        return { exitCode: 0, stdout: "", stderr: "" };
      },
    });
    const iosCheck = createReleaseSuite(context).find(
      (definition) =>
        typeof definition !== "function" && definition.check === "ios.release-validation"
    );

    expect(iosCheck && typeof iosCheck !== "function" ? await iosCheck.run(context) : null).toEqual(
      {
        status: "warn",
        check: "ios.release-validation",
        summary: "iOS release validation requires macOS",
        remediation:
          "Run npm run preflight:release on macOS to validate the generated iOS project.",
      }
    );
    expect(processSpecs).toEqual([]);
  });

  it("warns with an install command when the optional Android analyzer is unavailable", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "avihu-preflight-suite-"));
    temporaryRoots.push(root);
    const bundleRoot = path.join(root, "android", "app", "build", "outputs", "bundle", "release");
    await mkdir(bundleRoot, { recursive: true });
    await writeFile(path.join(root, "android", "gradlew"), "fixture wrapper");
    await writeFile(path.join(bundleRoot, "app-release.aab"), "fixture bundle");
    const calls: ProcessSpec[] = [];
    const context = createContext({
      projectRoot: root,
      runner: async (spec) => {
        calls.push(spec);
        if (spec.command === "which") {
          return { exitCode: 1, stdout: "", stderr: "not found" };
        }
        return { exitCode: 0, stdout: "ok", stderr: "" };
      },
    });
    const aabCheck = createAndroidReleaseChecks(async () => ({
      status: "pass",
      check: "native.prebuild",
      summary: "generated",
    })).aabValidation;
    const result = await aabCheck.run(context);

    expect(result).toMatchObject({
      status: "warn",
      check: "android.aab-validation",
      remediation: expect.stringContaining("github.com/google/bundletool/releases"),
    });
    expect(calls).toContainEqual(
      expect.objectContaining({ command: "which", args: ["bundletool"] })
    );
    expect(calls.every((call) => Array.isArray(call.args))).toBe(true);
  });

  it("downgrades only the exact acknowledged Expo Doctor maintenance finding", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "avihu-preflight-doctor-"));
    temporaryRoots.push(root);
    const knownOutput = [
      "1 check failed, indicating possible issues with the project.",
      "✖ Validate packages against React Native Directory package metadata",
      "Untested on New Architecture: react-native-health, react-native-infinite-wheel-picker",
      "Unmaintained: expo-health-connect, react-native-infinite-wheel-picker",
    ].join("\n");
    const doctor = createFastSuite(
      createContext({
        projectRoot: root,
        runner: async () => ({ exitCode: 1, stdout: knownOutput, stderr: "" }),
      })
    ).find(
      (definition) =>
        typeof definition !== "function" && definition.check === "dependencies.native-maintenance"
    );

    const knownResult =
      doctor && typeof doctor !== "function"
        ? await doctor.run(
            createContext({
              projectRoot: root,
              runner: async () => ({ exitCode: 1, stdout: knownOutput, stderr: "" }),
            })
          )
        : null;
    const unexpectedResult =
      doctor && typeof doctor !== "function"
        ? await doctor.run(
            createContext({
              projectRoot: root,
              runner: async () => ({
                exitCode: 1,
                stdout: "1 check failed\n✖ Validate Expo configuration",
                stderr: "invalid config",
              }),
            })
          )
        : null;

    expect(knownResult).toMatchObject({
      status: "warn",
      check: "dependencies.native-maintenance",
    });
    expect(unexpectedResult).toMatchObject({ status: "fail", check: "expo.doctor" });
  });

  it("does not start clean prebuild when a fast prerequisite fails", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "avihu-preflight-release-gate-"));
    temporaryRoots.push(root);
    const commands: string[] = [];
    const configuration = await createPreflightContext({
      projectRoot: root,
      tenantId: "avihu",
      environment: "development",
      processEnv: {},
      timestamp: "2026-08-24T00:00:00.000Z",
    });
    const context: PreflightSuiteContext = {
      ...configuration,
      platform: "linux",
      runner: async (spec) => {
        commands.push([spec.command, ...spec.args].join(" "));
        return { exitCode: 0, stdout: "", stderr: "" };
      },
    };

    const report = await runChecks(createReleaseSuite(context), context);

    expect(report.results).toContainEqual(
      expect.objectContaining({ status: "fail", check: "tenant.environment" })
    );
    expect(commands.some((command) => command.includes("expo prebuild"))).toBe(false);
  });
});

describe("injected process checks", () => {
  it("uses an argument-array runner and keeps sanitized full logs out of report evidence", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "avihu-preflight-process-"));
    temporaryRoots.push(root);
    const specs: ProcessSpec[] = [];
    const secret = "do-not-print-this-token";
    const context = createContext({
      projectRoot: root,
      processEnv: { EXPO_PUBLIC_API_AUTH_TOKEN: secret },
      runner: async (spec) => {
        specs.push(spec);
        return {
          exitCode: 23,
          stdout: `${"diagnostic line\n".repeat(200)}token=${secret}`,
          stderr: `Authorization: Bearer ${secret}`,
        };
      },
    });
    const check = createProcessCheck({
      check: "project.typescript",
      command: "npm",
      args: ["run", "typecheck"],
      successSummary: "TypeScript compilation passed",
      failureSummary: "TypeScript compilation failed",
      remediation: "Run npm run typecheck and fix the reported errors.",
    });

    const report = await runChecks([check], context);
    const logPath = path.join(
      root,
      ".preflight",
      "2026-08-24T00-00-00-000Z",
      "project.typescript.log"
    );
    const log = await readFile(logPath, "utf8");
    const serializedReport = JSON.stringify(report);

    expect(specs).toEqual([
      {
        command: "npm",
        args: ["run", "typecheck"],
        cwd: root,
        env: {
          APP_TENANT: "avihu",
          APP_ENV: "development",
        },
      },
    ]);
    expect(report.results[0]).toMatchObject({
      status: "fail",
      check: "project.typescript",
      details: expect.arrayContaining([`Exit code: 23`, `Full sanitized log: ${logPath}`]),
      remediation: `Run npm run typecheck and fix the reported errors. Log: ${logPath}`,
    });
    expect(serializedReport.length).toBeLessThan(4_000);
    expect(serializedReport).not.toContain(secret);
    expect(log).toContain("[REDACTED]");
    expect(log).not.toContain(secret);
    expect(log.length).toBeGreaterThan(serializedReport.length);
  });

  it("refuses a preflight log directory that resolves outside the project root", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "avihu-preflight-log-root-"));
    const external = await mkdtemp(path.join(tmpdir(), "avihu-preflight-log-external-"));
    temporaryRoots.push(root, external);
    await symlink(external, path.join(root, ".preflight"), "dir");
    let calls = 0;
    const context = createContext({
      projectRoot: root,
      runner: async () => {
        calls += 1;
        return { exitCode: 0, stdout: "", stderr: "" };
      },
    });
    const check = createProcessCheck({
      check: "project.typescript",
      command: "npm",
      args: ["run", "typecheck"],
      successSummary: "TypeScript compilation passed",
      failureSummary: "TypeScript compilation failed",
      remediation: "Run npm run typecheck.",
    });

    const report = await runChecks([check], context);

    expect(report.results[0]).toMatchObject({
      status: "fail",
      check: "project.typescript",
      summary: "Check threw an unexpected error",
    });
    expect(calls).toBe(0);
    expect(await readdir(external)).toEqual([]);
  });

  it("redacts secret-bearing command arguments from failure evidence and full logs", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "avihu-preflight-command-secret-"));
    temporaryRoots.push(root);
    const secret = "command-argument-secret";
    const context = createContext({
      projectRoot: root,
      processEnv: {
        PREFLIGHT_SMOKE_COMMAND_JSON: `["smoke-tool","--token","${secret}"]`,
      },
      runner: async () => ({ exitCode: 1, stdout: "failed", stderr: "" }),
    });
    const check = createProcessCheck({
      check: "smoke.infrastructure",
      command: "smoke-tool",
      args: ["--token", secret],
      successSummary: "Smoke passed",
      failureSummary: "Smoke failed",
      remediation: "Fix the smoke test.",
    });

    const report = await runChecks([check], context);
    expect(report.results[0]).toMatchObject({
      status: "fail",
      check: "smoke.infrastructure",
      summary: "Smoke failed",
    });
    const log = await readFile(
      path.join(root, ".preflight", "2026-08-24T00-00-00-000Z", "smoke.infrastructure.log"),
      "utf8"
    );

    expect(JSON.stringify(report)).not.toContain(secret);
    expect(log).not.toContain(secret);
    expect(log).toContain("--token [REDACTED]");
  });
});
