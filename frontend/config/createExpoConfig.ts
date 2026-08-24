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
    plugins: [
      "expo-localization",
      [
        "expo-build-properties",
        {
          android: tenant.androidBuildProperties,
        },
      ],
      "expo-background-task",
      [
        "expo-camera",
        {
          cameraPermission: tenant.permissions.camera,
          recordAudioAndroid: false,
        },
      ],
      "./plugins/withOptionalCameraFeature",
      [
        "expo-image-picker",
        {
          cameraPermission: tenant.permissions.camera,
          photosPermission: tenant.permissions.photos,
        },
      ],
      [
        "expo-notifications",
        {
          icon: tenant.assets.notificationIcon,
          color: tenant.assets.notificationColor,
          defaultChannel: "default",
          enableBackgroundRemoteNotifications: false,
        },
      ],
      [
        "react-native-health",
        {
          isClinicalDataEnabled: false,
          healthSharePermission: tenant.permissions.healthShare,
          healthUpdatePermission: tenant.permissions.healthUpdate,
        },
      ],
      "expo-health-connect",
      "./plugins/withHealthConnectPermissionDelegate",
      "./native-modules/live-steps-activity/plugin/withLiveStepsActivity",
    ],
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
      permissions: tenant.permissions.android,
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
      supportsRtl: tenant.featureFlags.supportsRtl,
      forcesRTL: tenant.featureFlags.forcesRtl,
      tenant: {
        id: tenant.id,
        displayName: tenant.displayName,
        environment,
        brand: tenant.brand,
        featureFlags: tenant.featureFlags,
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
