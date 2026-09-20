import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { createExpoConfig } from "../../../config/createExpoConfig";
import { createPreflightContext } from "../contexts";
import { runChecks } from "../engine";
import { applyPolicy } from "../policy";
import { getPreflightRunDirectory, type ProcessSpec } from "../processCheck";
import { createReleaseSuite, type PreflightSuiteContext } from "../suites";

const roots: string[] = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true }))));

const writeNativeFixture = async (context: PreflightSuiteContext) => {
  const android = path.join(context.projectRoot, "android");
  const main = path.join(android, "app", "src", "main");
  await mkdir(path.join(main, "res", "values"), { recursive: true });
  await writeFile(path.join(android, "gradlew"), "fixture wrapper");
  await writeFile(
    path.join(android, "gradle.properties"),
    [
      "android.compileSdkVersion=36",
      "android.targetSdkVersion=36",
      "android.enableProguardInReleaseBuilds=true",
      "android.enableShrinkResourcesInReleaseBuilds=true",
      "expo.edgeToEdgeEnabled=true",
    ].join("\n")
  );
  await writeFile(
    path.join(main, "AndroidManifest.xml"),
    [
      `<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="${context.expoConfig.android?.package}">`,
      '  <application android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher_round">',
      '    <activity android:name=".MainActivity" android:screenOrientation="portrait" />',
      "  </application>",
      "</manifest>",
    ].join("\n")
  );
  await writeFile(
    path.join(main, "res", "values", "styles.xml"),
    ["<resources>", '  <style name="AppTheme">', "  </style>", "</resources>"].join("\n")
  );

  const xcodeProject = path.join(context.projectRoot, "ios", "Fixture.xcodeproj");
  const iosApp = path.join(context.projectRoot, "ios", "Fixture");
  await mkdir(xcodeProject, { recursive: true });
  await mkdir(iosApp, { recursive: true });
  await writeFile(
    path.join(xcodeProject, "project.pbxproj"),
    [
      `PRODUCT_BUNDLE_IDENTIFIER = ${context.expoConfig.ios?.bundleIdentifier};`,
      "ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;",
      "INFOPLIST_FILE = Fixture/Info.plist;",
    ].join("\n")
  );
  const permissions = context.tenantConfig.permissions;
  await writeFile(
    path.join(iosApp, "Info.plist"),
    [
      "<plist><dict>",
      `<key>CFBundleURLSchemes</key><array><string>${String(context.expoConfig.scheme)}</string></array>`,
      "<key>UISupportedInterfaceOrientations</key><array><string>UIInterfaceOrientationPortrait</string></array>",
      `<key>NSCameraUsageDescription</key><string>${permissions.camera}</string>`,
      `<key>NSPhotoLibraryUsageDescription</key><string>${permissions.photos}</string>`,
      `<key>NSHealthShareUsageDescription</key><string>${permissions.healthShare}</string>`,
      `<key>NSHealthUpdateUsageDescription</key><string>${permissions.healthUpdate}</string>`,
      "</dict></plist>",
    ].join("\n")
  );
};

const labelProcess = (spec: ProcessSpec) => {
  if (spec.command.endsWith("gradlew")) return `gradle.${spec.args[0]}`;
  if (spec.command === "bundletool") return "bundletool.validate";
  if (spec.command === "which") return "bundletool.locate";
  if (spec.command === "xcodebuild") return "xcode.validate";
  if (spec.command === "smoke-tool") return "smoke";
  if (spec.command === "npm") return `npm.${spec.args.join(".")}`;
  return `npx.${spec.args.slice(0, 2).join(".")}`;
};

describe("complete release execution DAG", () => {
  it("runs every Android+iOS release node once in dependency order on mocked macOS", async () => {
    const projectRoot = await mkdtemp(path.join(tmpdir(), "preflight-release-dag-"));
    roots.push(projectRoot);
    const processEnv = {
      EXPO_PUBLIC_API_AUTH_TOKEN: "fixture-token",
      EXPO_PUBLIC_CLOUDFRONT_URL: "https://cdn.example.com",
      EXPO_PUBLIC_MODE: "development",
      EXPO_PUBLIC_SERVER: "https://api.example.com",
      EXPO_PUBLIC_TRAINER_PHONE_NUMBER: "1234",
    };
    const configuration = await createPreflightContext({
      projectRoot,
      tenantId: "avihu",
      environment: "development",
      processEnv,
      timestamp: "2026-08-24T03:00:00.000Z",
    });
    const tenantConfig = {
      ...configuration.tenantConfig,
      androidBuildProperties: {
        ...configuration.tenantConfig.androidBuildProperties,
        enableProguardInReleaseBuilds: true,
        enableShrinkResourcesInReleaseBuilds: true,
      },
    };
    const expoConfig = createExpoConfig({
      baseConfig: {},
      tenant: tenantConfig,
      environment: "development",
      processEnv,
    });
    if (expoConfig.android) expoConfig.android.edgeToEdgeEnabled = true;
    const events: string[] = [];
    const calls: ProcessSpec[] = [];
    let context: PreflightSuiteContext;
    const runner = async (spec: Readonly<ProcessSpec>) => {
      const copied = { ...spec, args: [...spec.args], env: { ...spec.env } };
      calls.push(copied);
      const label = labelProcess(copied);
      events.push(`start:${label}`);
      if (label === "npx.expo.prebuild") await writeNativeFixture(context);
      if (label === "gradle.bundleRelease") {
        const bundle = path.join(
          projectRoot,
          "android",
          "app",
          "build",
          "outputs",
          "bundle",
          "release"
        );
        const mapping = path.join(
          projectRoot,
          "android",
          "app",
          "build",
          "outputs",
          "mapping",
          "release"
        );
        await mkdir(bundle, { recursive: true });
        await mkdir(mapping, { recursive: true });
        await writeFile(path.join(bundle, "app-release.aab"), "nonempty-aab");
        await writeFile(path.join(mapping, "mapping.txt"), "nonempty-r8-mapping");
      }
      if (label === "npx.expo.export") {
        const output = copied.args[copied.args.indexOf("--output-dir") + 1];
        await mkdir(output, { recursive: true });
        for (const platform of ["android", "ios"] as const) {
          await writeFile(path.join(output, `${platform}.js`), `${platform}-bundle`);
          await writeFile(path.join(output, `${platform}.js.map`), `${platform}-source-map`);
        }
        await writeFile(
          path.join(output, "metadata.json"),
          JSON.stringify({
            version: 0,
            bundler: "metro",
            fileMetadata: {
              android: { bundle: "android.js", assets: [] },
              ios: { bundle: "ios.js", assets: [] },
            },
          })
        );
      }
      if (label === "bundletool.validate" || label === "xcode.validate") {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      events.push(`end:${label}`);
      return { exitCode: 0, stdout: `${label} passed`, stderr: "" };
    };
    context = {
      ...configuration,
      tenantConfig,
      expoConfig,
      platform: "darwin",
      runner,
      smokeCommand: { command: "smoke-tool", args: ["device-suite"] },
    };

    const report = applyPolicy(await runChecks(createReleaseSuite(context), context), {
      mode: "release",
      now: new Date("2026-08-24T03:00:00.000Z"),
    });
    const counts = new Map<string, number>();
    for (const spec of calls)
      counts.set(labelProcess(spec), (counts.get(labelProcess(spec)) ?? 0) + 1);
    expect(Object.fromEntries(counts)).toEqual({
      "npm.run.typecheck": 1,
      "npm.run.test:unit": 1,
      "npx.--yes.expo-doctor@1.20.2": 1,
      "npx.expo.install": 1,
      "npm.run.assets:check.--.--tenant.avihu": 1,
      "npx.expo.prebuild": 1,
      "gradle.lintRelease": 1,
      "gradle.bundleRelease": 1,
      "bundletool.locate": 1,
      "bundletool.validate": 1,
      "npx.expo.export": 1,
      "xcode.validate": 1,
      smoke: 1,
    });
    expect(report.exitCode).toBe(0);
    expect(report.results.map(({ check }) => check)).toEqual([
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
    expect(new Set(report.results.map(({ check }) => check)).size).toBe(report.results.length);
    expect(
      report.results.find((result) => result.check === "native.android-post-prebuild")
    ).toMatchObject({ status: "pass" });
    expect(report.results.find((result) => result.check === "artifacts.release")).toMatchObject({
      status: "pass",
    });
    const before = (first: string, second: string) =>
      expect(events.indexOf(first), `${first} before ${second}`).toBeLessThan(
        events.indexOf(second)
      );
    for (const fast of [
      "npm.run.typecheck",
      "npm.run.test:unit",
      "npx.--yes.expo-doctor@1.20.2",
      "npx.expo.install",
      "npm.run.assets:check.--.--tenant.avihu",
    ])
      before(`end:${fast}`, "start:npx.expo.prebuild");
    before("end:npx.expo.prebuild", "start:gradle.lintRelease");
    before("end:npx.expo.prebuild", "start:npx.expo.export");
    before("end:gradle.lintRelease", "start:gradle.bundleRelease");
    before("end:gradle.bundleRelease", "start:bundletool.validate");
    before("end:bundletool.validate", "start:smoke");
    before("end:npx.expo.export", "start:smoke");
    before("end:xcode.validate", "start:smoke");
    const logs = (await readdir(getPreflightRunDirectory(context))).filter((name) =>
      name.endsWith(".log")
    );
    expect(logs).toHaveLength(calls.length);
    expect(new Set(logs).size).toBe(logs.length);
  });
});
