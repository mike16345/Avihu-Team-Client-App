import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { createProcessCheck, type ProcessSpec } from "../processCheck";
import { runChecks } from "../engine";
import { createPreflightContext } from "../contexts";
import { createAndroidReleaseChecks } from "../checks/androidRelease";
import { createSmokeInfrastructureCheck } from "../checks/artifacts";
import { createIosReleaseCheck } from "../checks/iosRelease";
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
      "expo.doctor",
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
      "native.android-post-prebuild",
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

  it("uses xcodebuild with the generated project path on macOS", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "avihu-preflight-xcode-"));
    temporaryRoots.push(root);
    const configuration = await createPreflightContext({
      projectRoot: root,
      tenantId: "avihu",
      environment: "development",
      processEnv: {},
      timestamp: "2026-08-24T00:00:00.000Z",
    });
    const canonicalRoot = configuration.projectRoot;
    const project = path.join(canonicalRoot, "ios", "Fixture.xcodeproj");
    const app = path.join(canonicalRoot, "ios", "Fixture");
    await mkdir(project, { recursive: true });
    await mkdir(app, { recursive: true });
    const scheme = Array.isArray(configuration.expoConfig.scheme)
      ? configuration.expoConfig.scheme[0]
      : configuration.expoConfig.scheme;
    await writeFile(
      path.join(project, "project.pbxproj"),
      [
        `PRODUCT_BUNDLE_IDENTIFIER = ${configuration.expoConfig.ios?.bundleIdentifier};`,
        "ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;",
        "INFOPLIST_FILE = Fixture/Info.plist;",
      ].join("\n")
    );
    const permissions = configuration.tenantConfig.permissions;
    await writeFile(
      path.join(app, "Info.plist"),
      [
        "<plist><dict>",
        `<key>CFBundleURLSchemes</key><array><string>${scheme}</string></array>`,
        "<key>UISupportedInterfaceOrientations</key><array><string>UIInterfaceOrientationPortrait</string></array>",
        `<key>NSCameraUsageDescription</key><string>${permissions.camera}</string>`,
        `<key>NSPhotoLibraryUsageDescription</key><string>${permissions.photos}</string>`,
        `<key>NSHealthShareUsageDescription</key><string>${permissions.healthShare}</string>`,
        `<key>NSHealthUpdateUsageDescription</key><string>${permissions.healthUpdate}</string>`,
        "</dict></plist>",
      ].join("\n")
    );
    const calls: ProcessSpec[] = [];
    const context: PreflightSuiteContext = {
      ...configuration,
      platform: "darwin",
      runner: async (spec) => {
        calls.push(spec);
        return { exitCode: 0, stdout: "", stderr: "" };
      },
    };
    const result = await createIosReleaseCheck(async () => ({
      status: "pass",
      check: "native.prebuild",
      summary: "generated",
    })).run(context);
    expect(result).toMatchObject({ status: "pass", check: "ios.release-validation" });
    expect(calls).toEqual([
      {
        command: "xcodebuild",
        args: ["-list", "-json", "-project", project],
        cwd: canonicalRoot,
        env: { APP_TENANT: "avihu", APP_ENV: "development" },
      },
    ]);
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
      ...Array.from({ length: 8 }, (_, index) => `diagnostic ${index + 1}`),
      "  Untested on New Architecture: react-native-health, react-native-infinite-wheel-picker",
      "  Unmaintained: expo-health-connect, react-native-infinite-wheel-picker",
    ].join("\n");
    const doctor = createFastSuite(
      createContext({
        projectRoot: root,
        runner: async () => ({ exitCode: 1, stdout: knownOutput, stderr: "" }),
      })
    ).find((definition) => typeof definition !== "function" && definition.check === "expo.doctor");

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
    const extraPackageResult =
      doctor && typeof doctor !== "function"
        ? await doctor.run(
            createContext({
              projectRoot: root,
              runner: async () => ({
                exitCode: 1,
                stdout: knownOutput.replace(
                  "react-native-health, react-native-infinite-wheel-picker",
                  "extra-package, react-native-health, react-native-infinite-wheel-picker"
                ),
                stderr: "",
              }),
            })
          )
        : null;

    expect(knownResult).toMatchObject({
      status: "warn",
      check: "expo.doctor",
    });
    expect(unexpectedResult).toMatchObject({ status: "fail", check: "expo.doctor" });
    expect(extraPackageResult).toMatchObject({ status: "fail", check: "expo.doctor" });
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

  it("uses the Android project as the exact Gradle cwd with argument arrays", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "avihu-preflight-gradle-cwd-"));
    temporaryRoots.push(root);
    await mkdir(path.join(root, "android"), { recursive: true });
    await writeFile(path.join(root, "android", "gradlew"), "wrapper");
    const calls: ProcessSpec[] = [];
    const context = createContext({
      projectRoot: root,
      runner: async (spec) => {
        calls.push(spec);
        if (spec.args[0] === "bundleRelease") {
          const output = path.join(root, "android", "app", "build", "outputs", "bundle", "release");
          await mkdir(output, { recursive: true });
          await writeFile(path.join(output, "app-release.aab"), "bundle");
        }
        return { exitCode: 0, stdout: "", stderr: "" };
      },
    });
    const android = createAndroidReleaseChecks(async () => ({
      status: "pass",
      check: "native.android-post-prebuild",
      summary: "valid",
    }));

    await android.bundle.run(context);

    expect(calls).toEqual([
      {
        command: path.join(root, "android", "gradlew"),
        args: ["lintRelease", "--no-daemon"],
        cwd: path.join(root, "android"),
        env: { APP_TENANT: "avihu", APP_ENV: "development" },
      },
      {
        command: path.join(root, "android", "gradlew"),
        args: ["bundleRelease", "--no-daemon"],
        cwd: path.join(root, "android"),
        env: { APP_TENANT: "avihu", APP_ENV: "development" },
      },
    ]);
  });

  it("filters platform policy and release checks to the tenant's supported platforms", () => {
    const ios = createContext({ tenantConfig: { platforms: ["ios"] } as never });
    const android = createContext({ tenantConfig: { platforms: ["android"] } as never });
    expect(getCheckIds(createFastSuite(ios))).not.toContain("android.r8");
    expect(getCheckIds(createReleaseSuite(ios))).not.toContain("android.aab-validation");
    expect(getCheckIds(createFastSuite(android))).not.toContain("ios.platform-policy");
    expect(getCheckIds(createReleaseSuite(android))).not.toContain("ios.release-validation");
  });

  it("blocks clean prebuild when release policy promotes planned Android warnings", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "avihu-preflight-policy-gate-"));
    temporaryRoots.push(root);
    const commands: string[] = [];
    const configuration = await createPreflightContext({
      projectRoot: root,
      tenantId: "avihu",
      environment: "development",
      processEnv: {
        EXPO_PUBLIC_API_AUTH_TOKEN: "fixture",
        EXPO_PUBLIC_CLOUDFRONT_URL: "https://example.com",
        EXPO_PUBLIC_MODE: "development",
        EXPO_PUBLIC_SERVER: "https://example.com",
        EXPO_PUBLIC_TRAINER_PHONE_NUMBER: "1234",
      },
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
      expect.objectContaining({ check: "native.prebuild", status: "fail" })
    );
    expect(commands.some((command) => command.includes("expo prebuild"))).toBe(false);
  });

  it("executes successful composed release nodes exactly once and in dependency order", async () => {
    const projectRoot = path.resolve(import.meta.dirname, "../../..");
    const runDirectory = path.join(projectRoot, ".preflight", "2026-08-24T01-00-00-000Z");
    const configuration = await createPreflightContext({
      projectRoot,
      tenantId: "avihu",
      environment: "development",
      processEnv: {
        EXPO_PUBLIC_API_AUTH_TOKEN: "fixture",
        EXPO_PUBLIC_CLOUDFRONT_URL: "https://example.com",
        EXPO_PUBLIC_MODE: "development",
        EXPO_PUBLIC_SERVER: "https://example.com",
        EXPO_PUBLIC_TRAINER_PHONE_NUMBER: "1234",
      },
      timestamp: "2026-08-24T01:00:00.000Z",
    });
    const calls: ProcessSpec[] = [];
    const context: PreflightSuiteContext = {
      ...configuration,
      tenantConfig: { ...configuration.tenantConfig, platforms: ["ios"] },
      platform: "linux",
      runner: async (spec) => {
        calls.push(spec);
        if (spec.command === "npx" && spec.args[0] === "expo" && spec.args[1] === "export") {
          const outputDirectory = spec.args[spec.args.indexOf("--output-dir") + 1];
          await mkdir(outputDirectory, { recursive: true });
          await writeFile(path.join(outputDirectory, "ios.js"), "bundle");
          await writeFile(path.join(outputDirectory, "ios.js.map"), "map");
          await writeFile(
            path.join(outputDirectory, "metadata.json"),
            JSON.stringify({
              version: 0,
              bundler: "metro",
              fileMetadata: { ios: { bundle: "ios.js", assets: [] } },
            })
          );
        }
        return { exitCode: 0, stdout: "", stderr: "" };
      },
    };
    try {
      const report = await runChecks(createReleaseSuite(context), context);
      const prebuilds = calls.filter(
        (spec) => spec.command === "npx" && spec.args.slice(0, 2).join(" ") === "expo prebuild"
      );
      const exports = calls.filter(
        (spec) => spec.command === "npx" && spec.args.slice(0, 2).join(" ") === "expo export"
      );
      expect(prebuilds).toHaveLength(1);
      expect(exports).toHaveLength(1);
      expect(calls.indexOf(prebuilds[0])).toBeLessThan(calls.indexOf(exports[0]));
      expect(report.results.find((result) => result.check === "artifacts.release")).toMatchObject({
        status: "pass",
      });
    } finally {
      await rm(runDirectory, { recursive: true });
    }
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

  it("redacts the entire configured smoke command surface, including unknown and positional args", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "avihu-preflight-smoke-surface-"));
    temporaryRoots.push(root);
    const secrets = ["credential-secret", "-qZ", "short-secret", "positional-secret"];
    const context = createContext({
      projectRoot: root,
      smokeCommand: { command: "smoke-tool", args: ["--credential", ...secrets] },
      runner: async () => ({ exitCode: 1, stdout: "failed", stderr: "" }),
    });
    const check = createSmokeInfrastructureCheck(async () => ({
      status: "pass",
      check: "artifacts.release",
      summary: "ready",
    }));
    const result = await check.run(context);
    const log = await readFile(
      path.join(root, ".preflight", "2026-08-24T00-00-00-000Z", "smoke.infrastructure.log"),
      "utf8"
    );
    for (const secret of secrets) {
      expect(JSON.stringify(result)).not.toContain(secret);
      expect(log).not.toContain(secret);
    }
    expect(log).toContain("[CONFIGURED COMMAND] [REDACTED]");
  });
});
