import { readdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import type { ExpoConfig } from "@expo/config";
import type { ConfigurationPreflightContext } from "../contexts";
import type { CheckDefinition, CheckResult } from "../types";
import { auditAndroidEdgeToEdge } from "./androidEdgeToEdge";

type ExpoPluginEntry = NonNullable<ExpoConfig["plugins"]>[number];

const EXPO_ANDROID_APP_ICON = "@mipmap/ic_launcher";
const EXPO_ANDROID_ROUND_APP_ICON = "@mipmap/ic_launcher_round";
const EXPO_IOS_APP_ICON_CATALOG = "AppIcon";

const resolveInsideRoot = (root: string, ...segments: string[]) => {
  const resolvedRoot = path.resolve(root);
  const target = path.resolve(resolvedRoot, ...segments);

  if (target !== resolvedRoot && !target.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Refusing to read a generated path outside ${resolvedRoot}`);
  }

  return target;
};

const resolveExistingInsideRoot = async (root: string, ...segments: string[]) => {
  const target = resolveInsideRoot(root, ...segments);
  const canonicalTarget = await realpath(target);
  const canonicalRoot = path.resolve(root);

  if (
    canonicalTarget !== canonicalRoot &&
    !canonicalTarget.startsWith(`${canonicalRoot}${path.sep}`)
  ) {
    throw new Error("Generated native path resolves outside the project root");
  }

  return canonicalTarget;
};

const pathExists = async (root: string, ...segments: string[]) => {
  try {
    await resolveExistingInsideRoot(root, ...segments);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }

    throw error;
  }
};

const readOptional = async (root: string, ...segments: string[]) => {
  try {
    const target = await resolveExistingInsideRoot(root, ...segments);
    return await readFile(target, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
};

const parseProperties = (contents: string) =>
  Object.fromEntries(
    contents
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return separator < 0
          ? [line, ""]
          : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      })
  );

const getPluginName = (plugin: ExpoPluginEntry) =>
  typeof plugin === "string" ? plugin : (plugin[0] ?? null);

const getAndroidBuildProperties = (config: ExpoConfig): Record<string, unknown> => {
  const plugin = config.plugins?.find(
    (candidate) => getPluginName(candidate) === "expo-build-properties"
  );

  if (!plugin || typeof plugin === "string" || !plugin[1] || typeof plugin[1] !== "object") {
    return {};
  }

  const android = (plugin[1] as Record<string, unknown>).android;
  return android && typeof android === "object" ? (android as Record<string, unknown>) : {};
};

const addDrift = (
  drift: string[],
  label: string,
  expected: string | number | boolean,
  actual: string | number | boolean | null
) => {
  if (actual !== expected) {
    drift.push(`${label}: expected ${String(expected)}, generated ${String(actual ?? "missing")}`);
  }
};

const parseBooleanProperty = (value: string | undefined): boolean | string | null => {
  if (value === undefined) {
    return null;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return `invalid (${value})`;
};

const findManifestPackage = (manifest: string, buildGradle: string | null) => {
  const manifestMatch = manifest.match(/<manifest\b[^>]*\bpackage=["']([^"']+)["']/u);

  if (manifestMatch) {
    return manifestMatch[1];
  }

  const gradleMatch = buildGradle?.match(/(?:applicationId|namespace)\s*[=(]?\s*["']([^"']+)/u);
  return gradleMatch?.[1] ?? null;
};

const getApplicationAttribute = (manifest: string, attribute: string) => {
  const application = manifest.match(/<application\b[^>]*>/u)?.[0];

  if (!application) {
    return null;
  }

  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return application.match(new RegExp(`${escapedAttribute}=["']([^"']+)["']`, "u"))?.[1] ?? null;
};

const checkAndroid = async (
  context: Readonly<ConfigurationPreflightContext>,
  drift: string[],
  evidence: string[]
) => {
  const propertiesText = await readOptional(context.projectRoot, "android", "gradle.properties");
  const manifest = await readOptional(
    context.projectRoot,
    "android",
    "app",
    "src",
    "main",
    "AndroidManifest.xml"
  );
  const styles = await readOptional(
    context.projectRoot,
    "android",
    "app",
    "src",
    "main",
    "res",
    "values",
    "styles.xml"
  );
  const buildGradle = await readOptional(context.projectRoot, "android", "app", "build.gradle");

  if (!propertiesText || !manifest || !styles) {
    const missing = [
      !propertiesText ? "android/gradle.properties" : null,
      !manifest ? "android/app/src/main/AndroidManifest.xml" : null,
      !styles ? "android/app/src/main/res/values/styles.xml" : null,
    ].filter((value): value is string => value !== null);
    drift.push(`Generated Android files missing: ${missing.join(", ")}`);
    return;
  }

  const properties = parseProperties(propertiesText);
  const expectedBuild = getAndroidBuildProperties(context.expoConfig);
  const expectedPackage = context.expoConfig.android?.package ?? "missing";
  const targetSdk = Number(properties["android.targetSdkVersion"]);
  const compileSdk = Number(properties["android.compileSdkVersion"]);
  const proguard = parseBooleanProperty(properties["android.enableProguardInReleaseBuilds"]);
  const shrinkResources = parseBooleanProperty(
    properties["android.enableShrinkResourcesInReleaseBuilds"]
  );
  const orientation = manifest.match(/android:screenOrientation=["']([^"']+)["']/u)?.[1] ?? null;
  const packageName = findManifestPackage(manifest, buildGradle);
  const appIcon = getApplicationAttribute(manifest, "android:icon");
  const roundAppIcon = getApplicationAttribute(manifest, "android:roundIcon");
  addDrift(drift, "Android package", expectedPackage, packageName);
  addDrift(drift, "Android target SDK", Number(expectedBuild.targetSdkVersion), targetSdk);
  addDrift(drift, "Android compile SDK", Number(expectedBuild.compileSdkVersion), compileSdk);
  addDrift(drift, "Android R8", Boolean(expectedBuild.enableProguardInReleaseBuilds), proguard);
  addDrift(
    drift,
    "Android resource shrinking",
    Boolean(expectedBuild.enableShrinkResourcesInReleaseBuilds),
    shrinkResources
  );
  addDrift(drift, "Android orientation", context.expoConfig.orientation ?? "default", orientation);

  addDrift(drift, "Android app icon", EXPO_ANDROID_APP_ICON, appIcon);
  addDrift(drift, "Android round app icon", EXPO_ANDROID_ROUND_APP_ICON, roundAppIcon);

  evidence.push(
    `Android generated config: SDK ${compileSdk}/${targetSdk}, R8 ${String(proguard ?? "missing")}, icon ${appIcon ?? "missing"}`
  );
};

const decodeXml = (value: string) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");

const getPlistString = (plist: string, key: string) => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = plist.match(
    new RegExp(`<key>\\s*${escapedKey}\\s*</key>\\s*<string>([^<]*)</string>`, "u")
  );
  return match ? decodeXml(match[1].trim()) : null;
};

const getPlistArray = (plist: string, key: string) => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const array = plist.match(
    new RegExp(`<key>\\s*${escapedKey}\\s*</key>\\s*<array>([\\s\\S]*?)</array>`, "u")
  )?.[1];
  return array
    ? [...array.matchAll(/<string>([^<]*)<\/string>/gu)].map((match) => decodeXml(match[1].trim()))
    : [];
};

const getExpectedSchemes = (config: ExpoConfig) => {
  if (Array.isArray(config.scheme)) {
    return config.scheme;
  }

  return config.scheme ? [config.scheme] : [];
};

const findIosProject = async (projectRoot: string) => {
  const iosRoot = await resolveExistingInsideRoot(projectRoot, "ios");
  const entries = await readdir(iosRoot, { withFileTypes: true });
  const project = entries.find((entry) => entry.isDirectory() && entry.name.endsWith(".xcodeproj"));
  return project ? readOptional(projectRoot, "ios", project.name, "project.pbxproj") : null;
};

const findInfoPlist = async (projectRoot: string, project: string) => {
  const setting = project.match(/INFOPLIST_FILE\s*=\s*["']?([^;"']+)["']?;/u)?.[1].trim();

  if (setting && !setting.includes("$(")) {
    const configured = await readOptional(projectRoot, "ios", ...setting.split(/[\\/]/u));

    if (configured) {
      return configured;
    }
  }

  const iosRoot = await resolveExistingInsideRoot(projectRoot, "ios");
  const entries = await readdir(iosRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.endsWith(".xcodeproj")) {
      continue;
    }

    const plist = await readOptional(projectRoot, "ios", entry.name, "Info.plist");

    if (plist) {
      return plist;
    }
  }

  return null;
};

const checkIos = async (
  context: Readonly<ConfigurationPreflightContext>,
  drift: string[],
  evidence: string[]
) => {
  const project = await findIosProject(context.projectRoot);

  if (!project) {
    drift.push("Generated iOS project settings missing");
    return;
  }

  const plist = await findInfoPlist(context.projectRoot, project);

  if (!plist) {
    drift.push("Generated iOS Info.plist missing");
    return;
  }

  const expectedBundleIdentifier = context.expoConfig.ios?.bundleIdentifier ?? "missing";
  const expectedSchemes = getExpectedSchemes(context.expoConfig);
  const bundleIdentifiers = [
    ...project.matchAll(/PRODUCT_BUNDLE_IDENTIFIER\s*=\s*["']?([^;"']+)["']?;/gu),
  ].map((match) => match[1].trim());
  const appIconName = project
    .match(/ASSETCATALOG_COMPILER_APPICON_NAME\s*=\s*["']?([^;"']+)["']?;/u)?.[1]
    .trim();
  const schemes = getPlistArray(plist, "CFBundleURLSchemes");
  const orientations = getPlistArray(plist, "UISupportedInterfaceOrientations");
  const expectedOrientation = context.expoConfig.orientation ?? "default";
  const hasExpectedOrientation =
    expectedOrientation === "default" ||
    orientations.some((value) =>
      expectedOrientation === "portrait" ? value.includes("Portrait") : value.includes("Landscape")
    );

  if (
    bundleIdentifiers.length === 0 ||
    bundleIdentifiers.some((identifier) => identifier !== expectedBundleIdentifier)
  ) {
    drift.push(
      `iOS bundle identifier: expected ${expectedBundleIdentifier}, generated ${bundleIdentifiers.join(", ") || "missing"}`
    );
  }

  if (expectedSchemes.length === 0 || expectedSchemes.some((scheme) => !schemes.includes(scheme))) {
    drift.push(
      `iOS URL scheme: expected ${expectedSchemes.join(", ") || "missing"}, generated ${schemes.join(", ") || "missing"}`
    );
  }

  if (!hasExpectedOrientation) {
    drift.push(
      `iOS orientation: expected ${expectedOrientation}, generated ${orientations.join(", ") || "missing"}`
    );
  }

  for (const [key, expected] of [
    ["NSCameraUsageDescription", context.tenantConfig.permissions.camera],
    ["NSPhotoLibraryUsageDescription", context.tenantConfig.permissions.photos],
    ["NSHealthShareUsageDescription", context.tenantConfig.permissions.healthShare],
    ["NSHealthUpdateUsageDescription", context.tenantConfig.permissions.healthUpdate],
  ] as const) {
    addDrift(drift, `iOS ${key}`, expected, getPlistString(plist, key));
  }

  addDrift(drift, "iOS app icon", EXPO_IOS_APP_ICON_CATALOG, appIconName ?? null);

  evidence.push(
    `iOS generated config: bundle ${expectedBundleIdentifier}, icon ${appIconName ?? "missing"}`
  );
};

const runNativeDriftCheck = async (
  context: Readonly<ConfigurationPreflightContext>,
  platforms: readonly ("ios" | "android")[] = context.tenantConfig.platforms
): Promise<CheckResult> => {
  const drift: string[] = [];
  const evidence: string[] = [];
  const androidExists = await pathExists(context.projectRoot, "android");
  const iosExists = await pathExists(context.projectRoot, "ios");

  if (platforms.includes("android")) {
    const edgeToEdgeAudit = await auditAndroidEdgeToEdge(context.projectRoot, androidExists);
    drift.push(...edgeToEdgeAudit.drift);
    evidence.push(...edgeToEdgeAudit.evidence);

    if (androidExists) {
      await checkAndroid(context, drift, evidence);
    } else {
      evidence.push(
        "Android folder absent; clean generation required before native release validation."
      );
    }
  }

  if (platforms.includes("ios") && iosExists) {
    await checkIos(context, drift, evidence);
  } else if (platforms.includes("ios")) {
    evidence.push("iOS folder absent; clean generation required before native release validation.");
  }

  if (drift.length > 0) {
    return {
      status: "fail",
      check: "native.drift",
      summary: "Generated native configuration differs from resolved Expo configuration",
      details: [...drift, ...evidence],
      remediation: "Run a clean Expo prebuild for the selected tenant and environment.",
    };
  }

  return {
    status: "pass",
    check: "native.drift",
    summary:
      androidExists || iosExists
        ? "Generated native configuration is current"
        : "No generated native folders to compare",
    details: evidence,
  };
};

export const nativeDriftCheck: CheckDefinition<ConfigurationPreflightContext> = {
  check: "native.drift",
  run: runNativeDriftCheck,
};

export const androidNativeDriftCheck: CheckDefinition<ConfigurationPreflightContext> = {
  check: "native.android-post-prebuild",
  run: async (context) => {
    const result = await runNativeDriftCheck(context, ["android"]);
    return { ...result, check: "native.android-post-prebuild" };
  },
};
