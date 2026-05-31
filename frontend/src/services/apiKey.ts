import Constants from "expo-constants";

export const API_KEY_HEADER = "X-Api-Key";

const isDevMode = process.env.EXPO_PUBLIC_MODE === "development";

export const getApiKey = () =>
  isDevMode ? process.env.EXPO_PUBLIC_API_AUTH_TOKEN : Constants.expoConfig?.extra?.API_TOKEN;

export const applyApiKeyToHeaders = (headers: Headers) => {
  const apiKey = getApiKey();

  if (apiKey) {
    headers.set(API_KEY_HEADER, apiKey);
  }

  return headers;
};
