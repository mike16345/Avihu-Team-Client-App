import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { ExpoConfig } from "@expo/config";
import { runChecks } from "../engine";
import { renderHuman } from "../renderHuman";
import { renderJson } from "../renderJson";
import { createPreflightContext } from "../contexts";
import { environmentCheck } from "../checks/environment";
import { expoConfigCheck } from "../checks/expoConfig";
import { nativeDriftCheck } from "../checks/nativeDrift";
import { tenantConfigCheck } from "../checks/tenantConfig";

const temporaryRoots: string[] = [];

const createTemporaryRoot = async () => {
  const root = await mkdtemp(path.join(tmpdir(), "avihu-preflight-"));
  temporaryRoots.push(root);
  return root;
};

const createContext = async (processEnv: Readonly<Record<string, string | undefined>> = {}) =>
  createPreflightContext({
    projectRoot: await createTemporaryRoot(),
    tenantId: "avihu",
    environment: "production",
    processEnv,
  });

const writeAndroidFixture = async (root: string, targetSdkVersion: number, packageName: string) => {
  const androidRoot = path.join(root, "android");
  const mainRoot = path.join(androidRoot, "app", "src", "main");
  const valuesRoot = path.join(mainRoot, "res", "values");
  await mkdir(valuesRoot, { recursive: true });
  await writeFile(
    path.join(androidRoot, "gradle.properties"),
    [
      "android.compileSdkVersion=36",
      `android.targetSdkVersion=${targetSdkVersion}`,
      "android.enableProguardInReleaseBuilds=false",
      "android.enableShrinkResourcesInReleaseBuilds=false",
    ].join("\n")
  );
  await writeFile(
    path.join(mainRoot, "AndroidManifest.xml"),
    [
      `<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="${packageName}">`,
      '  <application android:icon="@mipmap/ic_launcher">',
      '    <activity android:name=".MainActivity" android:screenOrientation="portrait" />',
      "  </application>",
      "</manifest>",
    ].join("\n")
  );
  await writeFile(
    path.join(valuesRoot, "styles.xml"),
    [
      "<resources>",
      '  <style name="AppTheme">',
      '    <item name="android:windowOptOutEdgeToEdgeEnforcement">true</item>',
      "  </style>",
      "</resources>",
    ].join("\n")
  );
};

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true })));
});

describe("tenant and environment checks", () => {
  it("reports missing required environment variable names without exposing values", async () => {
    const context = await createContext({
      EXPO_PUBLIC_API_AUTH_TOKEN: "super-secret-value",
      EXPO_PUBLIC_SERVER: "https://api.example.com",
    });

    const report = await runChecks([environmentCheck], context);
    const serialized = JSON.stringify(report);

    expect(report.results[0]).toMatchObject({
      status: "fail",
      check: "tenant.environment",
    });
    expect(report.results[0].details).toEqual([
      "Missing: EXPO_PUBLIC_CLOUDFRONT_URL",
      "Missing: EXPO_PUBLIC_MODE",
      "Missing: EXPO_PUBLIC_TRAINER_PHONE_NUMBER",
    ]);
    expect(serialized).not.toContain("super-secret-value");
    expect(serialized).not.toContain("https://api.example.com");
  });

  it("accepts Avihu preview and production shared identity only when both declare it", async () => {
    const context = await createContext();
    const validResult = await tenantConfigCheck.run(context);
    const undeclaredContext = {
      ...context,
      tenantConfig: {
        ...context.tenantConfig,
        environments: {
          ...context.tenantConfig.environments,
          production: {
            ...context.tenantConfig.environments.production,
            allowSharedStoreIdentity: false,
          },
        },
      },
    };

    expect(validResult).toMatchObject({ status: "pass", check: "tenant.config" });
    expect(await tenantConfigCheck.run(undeclaredContext)).toMatchObject({
      status: "fail",
      check: "tenant.config",
    });
  });
});

describe("Expo configuration checks", () => {
  it("rejects duplicate plugin names regardless of string or tuple syntax", async () => {
    const context = await createContext();
    const expoConfig: ExpoConfig = {
      ...context.expoConfig,
      plugins: [...(context.expoConfig.plugins ?? []), "expo-camera"],
    };

    const result = await expoConfigCheck.run({ ...context, expoConfig });

    expect(result).toMatchObject({ status: "fail", check: "expo.config" });
    expect(result.details).toContain("Duplicate Expo plugin: expo-camera");
  });

  it("never includes a public client token value in human or JSON reports", async () => {
    const context = await createContext({
      EXPO_PUBLIC_API_AUTH_TOKEN: "super-secret-value",
      EXPO_PUBLIC_SERVER: "https://api.example.com",
      EXPO_PUBLIC_TRAINER_PHONE_NUMBER: "+15555550100",
      EXPO_PUBLIC_CLOUDFRONT_URL: "https://cdn.example.com",
      EXPO_PUBLIC_MODE: "production",
    });
    const report = await runChecks(
      [tenantConfigCheck, environmentCheck, expoConfigCheck, nativeDriftCheck],
      context
    );

    expect(renderHuman(report)).not.toContain("super-secret-value");
    expect(renderJson(report)).not.toContain("super-secret-value");
  });
});

describe("generated native drift", () => {
  it("fails when generated Android target SDK differs from resolved Expo config", async () => {
    const context = await createContext();
    await writeAndroidFixture(context.projectRoot, 35, "com.avihuteam.avihuteam");

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "fail", check: "native.drift" });
    expect(result.details).toContain("Android target SDK: expected 36, generated 35");
  });

  it("refuses generated native paths that escape the selected project root", async () => {
    const context = await createContext();
    const externalRoot = await createTemporaryRoot();
    await writeAndroidFixture(externalRoot, 36, "super-secret-value");
    await symlink(path.join(externalRoot, "android"), path.join(context.projectRoot, "android"));

    const report = await runChecks([nativeDriftCheck], context);
    const serialized = JSON.stringify(report);

    expect(report.results[0]).toMatchObject({ status: "fail", check: "native.drift" });
    expect(serialized).toMatch(/outside the project root/i);
    expect(serialized).not.toContain("super-secret-value");
  });

  it("does not confuse missing generated R8 flags with explicitly disabled flags", async () => {
    const context = await createContext();
    await writeAndroidFixture(context.projectRoot, 36, "com.avihuteam.avihuteam");
    await writeFile(
      path.join(context.projectRoot, "android", "gradle.properties"),
      ["android.compileSdkVersion=36", "android.targetSdkVersion=36"].join("\n")
    );

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "fail", check: "native.drift" });
    expect(result.details).toContain("Android R8: expected false, generated missing");
    expect(result.details).toContain(
      "Android resource shrinking: expected false, generated missing"
    );
  });

  it("passes absent ignored native folders with clean-generation guidance", async () => {
    const context = await createContext();

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "pass", check: "native.drift" });
    expect(result.details?.join(" ")).toMatch(/clean generation required/i);
  });
});
