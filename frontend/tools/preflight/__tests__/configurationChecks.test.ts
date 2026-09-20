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

const writeAndroidFixture = async (
  root: string,
  targetSdkVersion: number,
  packageName: string,
  icon = "@mipmap/ic_launcher",
  roundIcon = "@mipmap/ic_launcher_round",
  releaseOptimization = {
    enableProguardInReleaseBuilds: true,
    enableShrinkResourcesInReleaseBuilds: true,
  }
) => {
  const androidRoot = path.join(root, "android");
  const mainRoot = path.join(androidRoot, "app", "src", "main");
  const valuesRoot = path.join(mainRoot, "res", "values");
  await mkdir(valuesRoot, { recursive: true });
  await writeFile(
    path.join(androidRoot, "gradle.properties"),
    [
      "android.compileSdkVersion=36",
      `android.targetSdkVersion=${targetSdkVersion}`,
      `android.enableProguardInReleaseBuilds=${String(releaseOptimization.enableProguardInReleaseBuilds)}`,
      `android.enableShrinkResourcesInReleaseBuilds=${String(releaseOptimization.enableShrinkResourcesInReleaseBuilds)}`,
      "expo.edgeToEdgeEnabled=true",
    ].join("\n")
  );
  await writeFile(
    path.join(mainRoot, "AndroidManifest.xml"),
    [
      `<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="${packageName}">`,
      `  <application android:icon="${icon}" android:roundIcon="${roundIcon}">`,
      '    <activity android:name=".MainActivity" android:screenOrientation="portrait" />',
      "  </application>",
      "</manifest>",
    ].join("\n")
  );
  await writeFile(
    path.join(valuesRoot, "styles.xml"),
    ["<resources>", '  <style name="AppTheme">', "  </style>", "</resources>"].join("\n")
  );
};

const writeEdgeToEdgeAndroidFixture = async (
  root: string,
  options: {
    edgeToEdgeProperty?: boolean;
    styleItems?: string[];
    source?: string;
    rootSource?: string;
  } = {}
) => {
  await writeAndroidFixture(root, 36, "com.avihuteam.avihuteam");
  const properties = [
    "android.compileSdkVersion=36",
    "android.targetSdkVersion=36",
    "android.enableProguardInReleaseBuilds=true",
    "android.enableShrinkResourcesInReleaseBuilds=true",
  ];
  if (options.edgeToEdgeProperty !== undefined) {
    properties.push(`expo.edgeToEdgeEnabled=${String(options.edgeToEdgeProperty)}`);
  }
  await writeFile(path.join(root, "android", "gradle.properties"), properties.join("\n"));
  await writeFile(
    path.join(root, "android", "app", "src", "main", "res", "values", "styles.xml"),
    [
      "<resources>",
      '  <style name="AppTheme">',
      ...(options.styleItems ?? []).map((item) => `    ${item}`),
      "  </style>",
      "</resources>",
    ].join("\n")
  );

  if (options.source) {
    const sourceRoot = path.join(root, "src");
    await mkdir(sourceRoot, { recursive: true });
    await writeFile(path.join(sourceRoot, "ManualInset.tsx"), options.source);
  }

  if (options.rootSource) {
    await writeFile(path.join(root, "App.tsx"), options.rootSource);
  }
};

const writeIosFixture = async (
  root: string,
  bundleIdentifier: string,
  scheme: string,
  appIconName: string,
  permissions: {
    camera: string;
    photos: string;
    healthShare: string;
    healthUpdate: string;
  }
) => {
  const iosRoot = path.join(root, "ios");
  const projectRoot = path.join(iosRoot, "Fixture.xcodeproj");
  const appRoot = path.join(iosRoot, "Fixture");
  await mkdir(projectRoot, { recursive: true });
  await mkdir(appRoot, { recursive: true });
  await writeFile(
    path.join(projectRoot, "project.pbxproj"),
    [
      `PRODUCT_BUNDLE_IDENTIFIER = ${bundleIdentifier};`,
      `ASSETCATALOG_COMPILER_APPICON_NAME = ${appIconName};`,
      "INFOPLIST_FILE = Fixture/Info.plist;",
    ].join("\n")
  );
  await writeFile(
    path.join(appRoot, "Info.plist"),
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<plist><dict>",
      "<key>CFBundleURLTypes</key><array><dict>",
      "<key>CFBundleURLSchemes</key><array>",
      `<string>${scheme}</string>`,
      "</array></dict></array>",
      "<key>UISupportedInterfaceOrientations</key><array>",
      "<string>UIInterfaceOrientationPortrait</string>",
      "</array>",
      `<key>NSCameraUsageDescription</key><string>${permissions.camera}</string>`,
      `<key>NSPhotoLibraryUsageDescription</key><string>${permissions.photos}</string>`,
      `<key>NSHealthShareUsageDescription</key><string>${permissions.healthShare}</string>`,
      `<key>NSHealthUpdateUsageDescription</key><string>${permissions.healthUpdate}</string>`,
      "</dict></plist>",
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
  it.each([
    ["missing", undefined],
    ["false", false],
  ])("fails when the generated edge-to-edge property is %s", async (_label, property) => {
    const context = await createContext();
    await writeEdgeToEdgeAndroidFixture(context.projectRoot, {
      edgeToEdgeProperty: property,
    });

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "fail", check: "native.drift" });
    expect(result.details).toContain(
      `Generated Android property: expected expo.edgeToEdgeEnabled=true, generated ${property === undefined ? "missing" : "false"}`
    );
  });

  it("fails when generated styles retain the Android edge-to-edge opt-out", async () => {
    const context = await createContext();
    await writeEdgeToEdgeAndroidFixture(context.projectRoot, {
      edgeToEdgeProperty: true,
      styleItems: ['<item name="android:windowOptOutEdgeToEdgeEnforcement">false</item>'],
    });

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "fail", check: "native.drift" });
    expect(result.details).toContain(
      "Generated Android styles must not declare windowOptOutEdgeToEdgeEnforcement"
    );
  });

  it("fails when generated styles set a fixed status-bar color", async () => {
    const context = await createContext();
    await writeEdgeToEdgeAndroidFixture(context.projectRoot, {
      edgeToEdgeProperty: true,
      styleItems: ['<item name="android:statusBarColor">#ffffff</item>'],
    });

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "fail", check: "native.drift" });
    expect(result.details).toContain(
      "Generated Android styles must not declare a fixed statusBarColor"
    );
  });

  it("accepts the transparent status-bar color required by the edge-to-edge theme", async () => {
    const context = await createContext();
    await writeEdgeToEdgeAndroidFixture(context.projectRoot, {
      edgeToEdgeProperty: true,
      styleItems: ['<item name="android:statusBarColor">#00000000</item>'],
    });

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "pass", check: "native.drift" });
  });

  it("ignores edge-to-edge declarations inside generated XML comments", async () => {
    const context = await createContext();
    await writeEdgeToEdgeAndroidFixture(context.projectRoot, {
      edgeToEdgeProperty: true,
      styleItems: [
        '<!-- <item name="android:windowOptOutEdgeToEdgeEnforcement">true</item> -->',
        '<!-- <item name="android:statusBarColor">#ffffff</item> -->',
      ],
    });

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "pass", check: "native.drift" });
  });

  it("fails when application source calculates layout from StatusBar.currentHeight", async () => {
    const context = await createContext();
    await writeEdgeToEdgeAndroidFixture(context.projectRoot, {
      edgeToEdgeProperty: true,
      source: "const top = StatusBar.currentHeight ?? 0;\n",
    });

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "fail", check: "native.drift" });
    expect(result.details).toContain(
      "Application source must not use StatusBar.currentHeight: src/ManualInset.tsx"
    );
  });

  it("fails when the root App entry calculates layout from StatusBar.currentHeight", async () => {
    const context = await createContext();
    await writeEdgeToEdgeAndroidFixture(context.projectRoot, {
      edgeToEdgeProperty: true,
      rootSource: "const top = StatusBar.currentHeight ?? 0;\n",
    });

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "fail", check: "native.drift" });
    expect(result.details).toContain(
      "Application source must not use StatusBar.currentHeight: App.tsx"
    );
  });

  it("ignores StatusBar.currentHeight text inside comments and string literals", async () => {
    const context = await createContext();
    await writeEdgeToEdgeAndroidFixture(context.projectRoot, {
      edgeToEdgeProperty: true,
      source: [
        "// StatusBar.currentHeight is forbidden for layout.",
        'const auditDescription = "StatusBar.currentHeight";',
      ].join("\n"),
    });

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "pass", check: "native.drift" });
  });

  it("accepts generated edge-to-edge configuration and inset-safe application source", async () => {
    const context = await createContext();
    await writeEdgeToEdgeAndroidFixture(context.projectRoot, {
      edgeToEdgeProperty: true,
      source: "const top = insets.top;\n",
    });

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "pass", check: "native.drift" });
  });

  it("uses transformed resolved Expo identity and standard native asset catalogs", async () => {
    const context = await createContext();
    const expoConfig: ExpoConfig = {
      ...context.expoConfig,
      scheme: "resolved-scheme",
      android: {
        ...context.expoConfig.android,
        package: "com.resolved.android",
      },
      ios: {
        ...context.expoConfig.ios,
        bundleIdentifier: "com.resolved.ios",
      },
    };
    const resolvedContext = { ...context, expoConfig };
    await writeAndroidFixture(context.projectRoot, 36, "com.resolved.android");
    await writeIosFixture(
      context.projectRoot,
      "com.resolved.ios",
      "resolved-scheme",
      "AppIcon",
      context.tenantConfig.permissions
    );

    const result = await nativeDriftCheck.run(resolvedContext);

    expect(result).toMatchObject({ status: "pass", check: "native.drift" });
  });

  it("rejects wrong Android and iOS generated app-icon catalog settings", async () => {
    const context = await createContext();
    await writeAndroidFixture(
      context.projectRoot,
      36,
      "com.avihuteam.avihuteam",
      "@mipmap/wrong_icon"
    );
    await writeIosFixture(
      context.projectRoot,
      "com.avihuteam.avihuteam",
      "avihuteam",
      "WrongIcon",
      context.tenantConfig.permissions
    );

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "fail", check: "native.drift" });
    expect(result.details).toContain(
      "Android app icon: expected @mipmap/ic_launcher, generated @mipmap/wrong_icon"
    );
    expect(result.details).toContain("iOS app icon: expected AppIcon, generated WrongIcon");
  });

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
    expect(result.details).toContain("Android R8: expected true, generated missing");
    expect(result.details).toContain(
      "Android resource shrinking: expected true, generated missing"
    );
  });

  it.each([
    [
      "R8 minification",
      { enableProguardInReleaseBuilds: false, enableShrinkResourcesInReleaseBuilds: true },
      "Android R8: expected true, generated false",
    ],
    [
      "resource shrinking",
      { enableProguardInReleaseBuilds: true, enableShrinkResourcesInReleaseBuilds: false },
      "Android resource shrinking: expected true, generated false",
    ],
  ])("fails release preflight when generated %s is disabled", async (_label, flags, detail) => {
    const context = await createContext();
    await writeAndroidFixture(
      context.projectRoot,
      36,
      "com.avihuteam.avihuteam",
      "@mipmap/ic_launcher",
      "@mipmap/ic_launcher_round",
      flags
    );

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "fail", check: "native.drift" });
    expect(result.details).toContain(detail);
  });

  it("passes absent ignored native folders with clean-generation guidance", async () => {
    const context = await createContext();

    const result = await nativeDriftCheck.run(context);

    expect(result).toMatchObject({ status: "pass", check: "native.drift" });
    expect(result.details?.join(" ")).toMatch(/clean generation required/i);
  });
});
