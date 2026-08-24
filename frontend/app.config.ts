import "dotenv/config";
import { ExpoConfig, ConfigContext } from "@expo/config";

const APP_VERSION = "2.4.0";
const CAMERA_PERMISSION =
  "אפשר ל-$(PRODUCT_NAME) להשתמש במצלמה כדי לסרוק ברקודים ולצלם תמונות באפליקציה.";
export default ({ config }: ConfigContext): ExpoConfig => {
  const isDev = process.env.DEV_MODE === "true" || process.env.EXPO_PUBLIC_MODE === "development";

  return {
    ...config,
    name: "Avihu Team",
    slug: "avihu-team",
    version: APP_VERSION,
    orientation: "portrait",
    icon: "./assets/app-logo.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash-screen.png",
      backgroundColor: "#FFFFFF",
    },

    plugins: [
      ["expo-localization"],
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 26,
          },
        },
      ],
      "expo-background-task",
      [
        "expo-camera",
        {
          cameraPermission: CAMERA_PERMISSION,
          recordAudioAndroid: false,
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            minSdkVersion: 26,
          },
        },
      ],

      [
        "expo-image-picker",
        {
          cameraPermission: CAMERA_PERMISSION,
          photosPermission: "The app accesses your photos to let you share them with your friends.",
        },
      ],
      [
        "expo-notifications",

        {
          icon: "./assets/app-logo.png",
          color: "#ffffff",
          defaultChannel: "default",
          enableBackgroundRemoteNotifications: false,
        },
      ],
      [
        "react-native-health",
        {
          isClinicalDataEnabled: false,
          healthSharePermission:
            "כדי לעקוב אחרי הצעדים שלך, האפליקציה צריכה גישה לנתוני הצעדים והפעילות מאפליקציית הבריאות.",
          healthUpdatePermission: "האפליקציה לא משנה נתונים באפליקציית הבריאות.",
        },
      ],
      ["expo-health-connect"],
      "./plugins/withHealthConnectPermissionDelegate",
      "./native-modules/live-steps-activity/plugin/withLiveStepsActivity",
    ],
    scheme: "avihuteam",
    ios: {
      bundleIdentifier: isDev ? "com.avihuteam.avihuteam.dev" : "com.avihuteam.avihuteam",
      supportsTablet: false,
      splash: {
        image: "./assets/splash-screen.png",
        backgroundColor: "#FFFFFF",
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/app-logo.png",
        backgroundColor: "#FFFFFF",
      },
      permissions: [
        "android.permission.health.READ_HEALTH_DATA_IN_BACKGROUND",
        "android.permission.health.READ_STEPS",
      ],
      softwareKeyboardLayoutMode: "resize",
      package: isDev ? "com.avihuteam.avihuteam.dev" : "com.avihuteam.avihuteam",
    },
    extra: {
      eas: {
        projectId: "bbbbb60d-eb47-48fb-a278-517aba8dcea2",
      },
      supportsRtl: true,
      forcesRTL: true,

      API_URL: process.env.API_URL,
      API_URL_PREVIEW: process.env.API_URL_PREVIEW,
      API_TOKEN: process.env.API_KEY,
      TRAINER_PHONE_NUMBER: process.env.TRAINER_PHONE_NUMBER,
      CLOUDFRONT_URL: process.env.CLOUDFRONT_URL,
      DEV_MODE: process.env.DEV_MODE,
    },
    owner: "avihuteam",
    runtimeVersion: APP_VERSION,
    updates: {
      enabled: true,
      url: "https://u.expo.dev/bbbbb60d-eb47-48fb-a278-517aba8dcea2",
    },
    sdkVersion: "53.0.0",
    platforms: ["ios", "android"],
  };
};
