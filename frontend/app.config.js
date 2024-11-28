import "dotenv/config"; // If you are using a .env file locally

export default ({ config }) => ({
  ...config,
  name: "Avihu Team",
  slug: "avihu-team",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/app-icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/avihu/avihu-logo-black.png",
    backgroundColor: "#000000",
  },
  ios: {
    supportsTablet: true,
    splash: {
      image: "./assets/avihu/avihu-logo-black.png",
      backgroundColor: "#000000",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#000000",
    },
    package: "com.avihuteam.avihuteam",
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png",
  },
  updates: {
    enabled: true,
    runtimeVersion: "1.0.0",
    url: "https://u.expo.dev/bbbbb60d-eb47-48fb-a278-517aba8dcea2",
  },
  extra: {
    eas: {
      projectId: "bbbbb60d-eb47-48fb-a278-517aba8dcea2",
    },
    API_URL: process.env.API_URL,
    API_TOKEN: process.env.API_KEY,
    TRAINER_PHONE_NUMBER: process.env.TRAINER_PHONE_NUMBER,
  },
});
