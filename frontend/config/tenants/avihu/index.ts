import type { TenantConfig } from "../types";
import { featureDefaults, nativeCapabilities } from "./features";
import { tenantTheme } from "./theme";

const CAMERA_PERMISSION =
  "אפשר ל-$(PRODUCT_NAME) להשתמש במצלמה כדי לסרוק ברקודים ולצלם תמונות באפליקציה.";

const REQUIRED_PUBLIC_ENVIRONMENT_VARIABLES = [
  "EXPO_PUBLIC_API_AUTH_TOKEN",
  "EXPO_PUBLIC_SERVER",
  "EXPO_PUBLIC_TRAINER_PHONE_NUMBER",
  "EXPO_PUBLIC_CLOUDFRONT_URL",
  "EXPO_PUBLIC_MODE",
];

export const avihuTenant = {
  kind: "repository",
  id: "avihu",
  displayName: "Elevate Coach",
  slug: "avihu-team",
  version: "2.4.0",
  eas: {
    status: "linked",
    owner: "avihuteam",
    projectId: "bbbbb60d-eb47-48fb-a278-517aba8dcea2",
    updateUrl: "https://u.expo.dev/bbbbb60d-eb47-48fb-a278-517aba8dcea2",
  },
  runtimeVersion: { policy: "appVersion" },
  orientation: "portrait",
  platforms: ["ios", "android"],
  assets: {
    legacy: false,
    icon: "./config/tenants/assets/avihu/generated/apple-icon.png",
    adaptiveIconForeground:
      "./config/tenants/assets/avihu/generated/android-adaptive-foreground.png",
    adaptiveIconBackgroundImage:
      "./config/tenants/assets/avihu/generated/android-adaptive-background.png",
    adaptiveIconBackgroundColor: "#FFFFFF",
    notificationIcon: "./config/tenants/assets/avihu/generated/notification-icon.png",
    notificationColor: "#ffffff",
    splash: "./config/tenants/assets/avihu/generated/splash.png",
    splashBackgroundColor: "#FFFFFF",
  },
  brand: {
    primaryColor: "#000000",
    backgroundColor: "#FFFFFF",
  },
  theme: tenantTheme,
  permissions: {
    camera: CAMERA_PERMISSION,
    photos: "The app accesses your photos to let you share them with your friends.",
    healthShare:
      "כדי לעקוב אחרי הצעדים שלך, האפליקציה צריכה גישה לנתוני הצעדים והפעילות מאפליקציית הבריאות.",
    healthUpdate: "האפליקציה לא משנה נתונים באפליקציית הבריאות.",
    android: [
      "android.permission.health.READ_HEALTH_DATA_IN_BACKGROUND",
      "android.permission.health.READ_STEPS",
    ],
  },
  androidBuildProperties: {
    compileSdkVersion: 36,
    targetSdkVersion: 36,
    minSdkVersion: 26,
    enableProguardInReleaseBuilds: true,
    enableShrinkResourcesInReleaseBuilds: true,
  },
  localization: {
    supportsRtl: true,
    forcesRtl: true,
  },
  featureDefaults,
  nativeCapabilities,
  requiredEnvironmentVariables: {
    development: REQUIRED_PUBLIC_ENVIRONMENT_VARIABLES,
    preview: [...REQUIRED_PUBLIC_ENVIRONMENT_VARIABLES, "EXPO_PUBLIC_API_URL_PREVIEW"],
    production: REQUIRED_PUBLIC_ENVIRONMENT_VARIABLES,
  },
  environments: {
    development: {
      iosBundleIdentifier: "com.avihuteam.avihuteam.dev",
      androidPackage: "com.avihuteam.avihuteam.dev",
      scheme: "avihuteam",
      allowSharedStoreIdentity: false,
    },
    preview: {
      iosBundleIdentifier: "com.avihuteam.avihuteam",
      androidPackage: "com.avihuteam.avihuteam",
      scheme: "avihuteam",
      allowSharedStoreIdentity: true,
    },
    production: {
      iosBundleIdentifier: "com.avihuteam.avihuteam",
      androidPackage: "com.avihuteam.avihuteam",
      scheme: "avihuteam",
      allowSharedStoreIdentity: true,
    },
  },
} satisfies TenantConfig;
