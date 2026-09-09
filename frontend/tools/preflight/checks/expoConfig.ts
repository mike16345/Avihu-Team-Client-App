import type { ExpoConfig } from "@expo/config";
import type { CheckDefinition, CheckResult } from "../types";
import type { ConfigurationPreflightContext } from "../contexts";

type PluginProperties = Record<string, unknown>;
type ExpoPluginEntry = NonNullable<ExpoConfig["plugins"]>[number];

const getPluginName = (plugin: ExpoPluginEntry) =>
  typeof plugin === "string" ? plugin : (plugin[0] ?? null);

const getPluginProperties = (config: ExpoConfig, name: string): PluginProperties | undefined => {
  const plugin = config.plugins?.find((candidate) => getPluginName(candidate) === name);

  if (!plugin || typeof plugin === "string") {
    return undefined;
  }

  const properties = plugin[1];
  return properties && typeof properties === "object" ? properties : undefined;
};

const serializeComparable = (value: unknown) => JSON.stringify(value);

const compare = (details: string[], label: string, expected: unknown, actual: unknown) => {
  if (serializeComparable(actual) !== serializeComparable(expected)) {
    details.push(`${label}: expected ${String(expected)}, resolved ${String(actual)}`);
  }
};

const getDuplicatePluginDetails = (config: ExpoConfig) => {
  const counts = new Map<string, number>();

  for (const plugin of config.plugins ?? []) {
    const name = getPluginName(plugin);

    if (!name) {
      continue;
    }

    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([name]) => `Duplicate Expo plugin: ${name}`)
    .sort();
};

const getAndroidBuildProperties = (config: ExpoConfig) => {
  const properties = getPluginProperties(config, "expo-build-properties");
  const android = properties?.android;
  return android && typeof android === "object" ? (android as PluginProperties) : undefined;
};

const runExpoConfigCheck = (context: Readonly<ConfigurationPreflightContext>): CheckResult => {
  const { expoConfig, tenantConfig, environment } = context;
  const identity = tenantConfig.environments[environment];
  const drift = getDuplicatePluginDetails(expoConfig);
  const eas = expoConfig.extra?.eas as Record<string, unknown> | undefined;
  const buildProperties = getAndroidBuildProperties(expoConfig);
  const camera = getPluginProperties(expoConfig, "expo-camera");
  const imagePicker = getPluginProperties(expoConfig, "expo-image-picker");
  const notifications = getPluginProperties(expoConfig, "expo-notifications");

  compare(drift, "Android package", identity.androidPackage, expoConfig.android?.package);
  compare(
    drift,
    "iOS bundle identifier",
    identity.iosBundleIdentifier,
    expoConfig.ios?.bundleIdentifier
  );
  compare(drift, "URL scheme", identity.scheme, expoConfig.scheme);
  if (tenantConfig.eas.status === "linked") {
    compare(drift, "Expo owner", tenantConfig.eas.owner, expoConfig.owner);
    compare(drift, "EAS project ID", tenantConfig.eas.projectId, eas?.projectId);
    compare(drift, "EAS update URL", tenantConfig.eas.updateUrl, expoConfig.updates?.url);
  } else {
    compare(drift, "Expo owner", undefined, expoConfig.owner);
    compare(drift, "EAS project ID", undefined, eas?.projectId);
    compare(drift, "EAS updates", undefined, expoConfig.updates);
  }
  compare(drift, "Runtime version", tenantConfig.version, expoConfig.runtimeVersion);
  compare(drift, "Orientation", tenantConfig.orientation, expoConfig.orientation);
  compare(drift, "App icon", tenantConfig.assets.icon, expoConfig.icon);
  compare(drift, "Splash image", tenantConfig.assets.splash, expoConfig.splash?.image);
  compare(
    drift,
    "Adaptive icon foreground",
    tenantConfig.assets.adaptiveIconForeground,
    expoConfig.android?.adaptiveIcon?.foregroundImage
  );
  compare(
    drift,
    "Adaptive icon background image",
    tenantConfig.assets.adaptiveIconBackgroundImage,
    expoConfig.android?.adaptiveIcon?.backgroundImage
  );
  compare(
    drift,
    "Adaptive icon background color",
    tenantConfig.assets.adaptiveIconBackgroundColor,
    expoConfig.android?.adaptiveIcon?.backgroundColor
  );
  compare(drift, "Notification icon", tenantConfig.assets.notificationIcon, notifications?.icon);
  compare(drift, "Notification color", tenantConfig.assets.notificationColor, notifications?.color);
  compare(drift, "Camera permission", tenantConfig.permissions.camera, camera?.cameraPermission);
  compare(
    drift,
    "Photo permission",
    tenantConfig.permissions.photos,
    imagePicker?.photosPermission
  );

  for (const [name, expected] of Object.entries(tenantConfig.androidBuildProperties)) {
    compare(drift, `Android build property ${name}`, expected, buildProperties?.[name]);
  }

  if (drift.length > 0) {
    return {
      status: "fail",
      check: "expo.config",
      summary: "Resolved Expo configuration is inconsistent",
      details: drift,
      remediation: "Remove duplicate plugins or correct the tenant Expo configuration resolver.",
    };
  }

  const edgeToEdgeEnabled = Boolean(expoConfig.android?.edgeToEdgeEnabled);
  const r8Enabled = Boolean(buildProperties?.enableProguardInReleaseBuilds);
  const resourceShrinkingEnabled = Boolean(buildProperties?.enableShrinkResourcesInReleaseBuilds);

  return {
    status: "pass",
    check: "expo.config",
    summary: "Resolved Expo configuration matches the selected tenant",
    details: [
      `Android edge-to-edge: ${edgeToEdgeEnabled ? "enabled" : "disabled"}`,
      `Android R8: ${r8Enabled ? "enabled" : "disabled"}`,
      `Android resource shrinking: ${resourceShrinkingEnabled ? "enabled" : "disabled"}`,
      `Asset references: ${tenantConfig.assets.legacy ? "legacy" : "tenant-generated"}`,
    ],
  };
};

export const expoConfigCheck: CheckDefinition<ConfigurationPreflightContext> = {
  check: "expo.config",
  run: runExpoConfigCheck,
};
