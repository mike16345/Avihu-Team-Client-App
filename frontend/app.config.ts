import "dotenv/config";
import { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const isDev = !!process.env.DEV_MODE;

  return {
    ...config,
    name: "Avihu Team",
    slug: "avihu-team",
    version: "2.2.0",
    orientation: "portrait",
    icon: "./assets/app-logo.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash-screen.png",
      backgroundColor: "#FFFFFF",
    },

    plugins: [
      ["expo-localization"],
      "expo-background-task",

      [
        "expo-image-picker",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access the camera.",
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
    ],
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
      softwareKeyboardLayoutMode: "resize",
      package: "com.avihuteam.avihuteam",
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
    runtimeVersion: { policy: "appVersion" },
    updates: {
      enabled: true,
      url: "https://u.expo.dev/bbbbb60d-eb47-48fb-a278-517aba8dcea2",
    },
    sdkVersion: "53.0.0",
    platforms: ["ios", "android"],
  };
};
