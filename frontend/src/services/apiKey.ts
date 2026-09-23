import Constants from "expo-constants";

export const API_KEY_HEADER = "X-Api-Key";

export const getApiKey = () => {
  const extra = Constants.expoConfig?.extra;
  const tenant = extra?.tenant as { environment?: string } | undefined;
  const usesEasClientKey =
    tenant?.environment === "production" || tenant?.environment === "preview";
  const apiKey = usesEasClientKey ? extra?.API_TOKEN : process.env.EXPO_PUBLIC_API_AUTH_TOKEN;

  if (!apiKey) {
    throw new Error(
      usesEasClientKey
        ? "Production API client key is required"
        : "EXPO_PUBLIC_API_AUTH_TOKEN is required"
    );
  }

  return apiKey;
};

export const applyApiKeyToHeaders = (headers: Headers) => {
  const apiKey = getApiKey();

  if (apiKey) {
    headers.set(API_KEY_HEADER, apiKey);
  }

  return headers;
};
