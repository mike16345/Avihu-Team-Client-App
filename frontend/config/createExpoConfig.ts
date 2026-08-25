import type { ExpoConfig } from "@expo/config";
import type { TenantConfig, TenantEnvironment } from "./tenants/types";

type ProcessEnvironment = Readonly<Record<string, string | undefined>>;

export interface CreateExpoConfigInput {
  baseConfig: Partial<ExpoConfig>;
  tenant: TenantConfig;
  environment: TenantEnvironment;
  processEnv: ProcessEnvironment;
}

const getPublicRuntimeExtra = (processEnv: ProcessEnvironment) => ({
  API_URL: processEnv.EXPO_PUBLIC_SERVER,
  API_URL_PREVIEW: processEnv.EXPO_PUBLIC_API_URL_PREVIEW,
  TRAINER_PHONE_NUMBER: processEnv.EXPO_PUBLIC_TRAINER_PHONE_NUMBER,
  CLOUDFRONT_URL: processEnv.EXPO_PUBLIC_CLOUDFRONT_URL,
  DEV_MODE: processEnv.EXPO_PUBLIC_MODE,
});

export const createTenantPlugins = (tenant: TenantConfig): NonNullable<ExpoConfig["plugins"]> => {
  const plugins: NonNullable<ExpoConfig["plugins"]> = [
    "expo-localization",
    ["expo-build-properties", { android: tenant.androidBuildProperties }],
    "./plugins/withFmtXcode26Fix",
  ];
  if (tenant.nativeCapabilities.backgroundTasks) plugins.push("expo-background-task");
  if (tenant.nativeCapabilities.camera) {
    plugins.push([
      "expo-camera",
      { cameraPermission: tenant.permissions.camera, recordAudioAndroid: false },
    ]);
    plugins.push("./plugins/withOptionalCameraFeature");
  }
  if (tenant.nativeCapabilities.photoLibrary) {
    plugins.push([
      "expo-image-picker",
      {
        cameraPermission: tenant.permissions.camera,
        photosPermission: tenant.permissions.photos,
      },
    ]);
  }
  if (tenant.nativeCapabilities.notifications) {
    plugins.push([
      "expo-notifications",
      {
        icon: tenant.assets.notificationIcon,
        color: tenant.assets.notificationColor,
        defaultChannel: "default",
        enableBackgroundRemoteNotifications: false,
      },
    ]);
  }
  if (tenant.nativeCapabilities.appleHealth) {
    plugins.push([
      "react-native-health",
      {
        isClinicalDataEnabled: false,
        healthSharePermission: tenant.permissions.healthShare,
        healthUpdatePermission: tenant.permissions.healthUpdate,
      },
    ]);
  }
  if (tenant.nativeCapabilities.healthConnect) {
    plugins.push("expo-health-connect", "./plugins/withHealthConnectPermissionDelegate");
  }
  if (tenant.nativeCapabilities.liveActivities) {
    plugins.push("./native-modules/live-steps-activity/plugin/withLiveStepsActivity");
  }
  return plugins;
};

export const createExpoConfig = ({
  baseConfig,
  tenant,
  environment,
  processEnv,
}: CreateExpoConfigInput): ExpoConfig => {
  const identity = tenant.environments[environment];

  return {
    ...baseConfig,
    name: tenant.displayName,
    slug: tenant.slug,
    version: tenant.version,
    orientation: tenant.orientation,
    icon: tenant.assets.icon,
    userInterfaceStyle: "automatic",
    splash: {
      image: tenant.assets.splash,
      backgroundColor: tenant.assets.splashBackgroundColor,
    },
    plugins: createTenantPlugins(tenant),
    scheme: identity.scheme,
    ios: {
      bundleIdentifier: identity.iosBundleIdentifier,
      supportsTablet: false,
      splash: {
        image: tenant.assets.splash,
        backgroundColor: tenant.assets.splashBackgroundColor,
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: tenant.assets.adaptiveIconForeground,
        backgroundImage: tenant.assets.adaptiveIconBackgroundImage,
        backgroundColor: tenant.assets.adaptiveIconBackgroundColor,
      },
      edgeToEdgeEnabled: true,
      permissions: tenant.nativeCapabilities.healthConnect ? tenant.permissions.android : [],
      softwareKeyboardLayoutMode: "resize",
      package: identity.androidPackage,
    },
    androidStatusBar: {
      backgroundColor: "#00000000",
    },
    extra: {
      eas: {
        projectId: tenant.projectId,
      },
      supportsRtl: tenant.localization.supportsRtl,
      forcesRTL: tenant.localization.forcesRtl,
      tenant: {
        id: tenant.id,
        displayName: tenant.displayName,
        environment,
        brand: tenant.brand,
        theme: tenant.theme,
        localization: tenant.localization,
        featureDefaults: tenant.featureDefaults,
        nativeCapabilities: tenant.nativeCapabilities,
        showEnvironmentBadge: environment !== "production",
      },
      ...getPublicRuntimeExtra(processEnv),
    },
    owner: tenant.owner,
    runtimeVersion: tenant.version,
    updates: {
      enabled: true,
      url: tenant.updateUrl,
    },
    sdkVersion: "53.0.0",
    platforms: tenant.platforms,
  };
};
