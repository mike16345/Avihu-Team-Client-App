export const API_KEY_HEADER = "X-Api-Key";

export const getApiKey = () => {
  const apiKey = process.env.EXPO_PUBLIC_API_AUTH_TOKEN;

  if (!apiKey) {
    throw new Error("EXPO_PUBLIC_API_AUTH_TOKEN is required");
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
