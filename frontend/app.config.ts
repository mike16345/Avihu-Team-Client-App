import "dotenv/config";
import { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const isDev = !!process.env.DEV_MODE;

  return {
    ...config,
    name: "Avihu Team",
    slug: "avihu-team",
    version: "1.2.0",
    orientation: "portrait",
    icon: "./assets/appstore.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/avihu/avihuFlyTrapWithLogo.jpeg",
      backgroundColor: "#000000",
    },
    plugins: [
      ["expo-localization"],

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
          icon: "./assets/app-icon.png",
          color: "#ffffff",
          defaultChannel: "default",
          enableBackgroundRemoteNotifications: false,
        },
      ],
    ],
    ios: {
      bundleIdentifier: isDev ? "com.avihuteam.test" : "com.avihuteam.avihuteam",
      supportsTablet: false,
      splash: {
        image: "./assets/avihu/avihuFlyTrapWithLogo.jpeg",
        backgroundColor: "#000000",
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/playstore.png",
        backgroundColor: "#000000",
      },

      package: "com.avihuteam.avihuteam",
    },
    extra: {
      eas: {
        projectId: "bbbbb60d-eb47-48fb-a278-517aba8dcea2",
      },
      supportsRtl: true,
      forcesRTL: true,

      API_URL: process.env.API_URL,
      API_TOKEN: process.env.API_KEY,
      TRAINER_PHONE_NUMBER: process.env.TRAINER_PHONE_NUMBER,
      CLOUDFRONT_URL: process.env.CLOUDFRONT_URL,
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
