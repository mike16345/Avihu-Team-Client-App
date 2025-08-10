import Constants from "expo-constants";
import Toast, { ToastType } from "react-native-toast-message";

export const testEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

export const testPhone = (phone: string) => {
  const phoneRegex = /^[A-Za-z0-9]{3,}$/;

  return phoneRegex.test(phone);
};

export const testPassword = (password: string) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%])(?=.*\d).+$/;

  return passwordRegex.test(password);
};

export const hexToRgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const extractVideoId = (url: string): string => {
  let videoId: string = "";

  // Check if URL contains ?v=
  if (url.includes("?v=")) {
    videoId = url.split("?v=")[1]?.split("&")[0];
  }
  // Check if it's a short YouTube URL
  else if (url.startsWith("https://youtu.be/")) {
    videoId = url.split("https://youtu.be/")[1]?.split("?")[0];
  }

  return videoId;
};

export const getYouTubeThumbnail = (id: string) => {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
};

export const generateWheelPickerData = (minRange: number, maxRange: number, stepSize = 1) => {
  const data = [];
  for (var i = minRange; i <= maxRange; i += stepSize) {
    data.push({ value: i, label: `${i}` });
  }

  return data;
};

export const createRetryFunction = (ignoreStatusCode: number, maxRetries: number = 3) => {
  return (failureCount: number, error: any) => {
    console.log("error", error);
    // Check if error response exists and matches the ignored status code
    if (error?.status === ignoreStatusCode) {
      return false; // Stop retrying for the specified status code
    }
    // Retry up to the specified max retries for other errors
    return failureCount < maxRetries;
  };
};

export const buildPhotoUrls = (urls: string[]) => {
  const imageUrls = urls.map((url) => {
    return buildPhotoUrl(url);
  });

  return imageUrls;
};

export const buildPhotoUrl = (url: string) => {
  const isDev =
    !!process.env.DEV_MODE ||
    process.env.EXPO_PUBLIC_MODE == "development" ||
    !!Constants?.expoConfig?.extra?.DEV_MODE;

  const cloudfrontUrl = isDev
    ? process.env.EXPO_PUBLIC_CLOUDFRONT_URL
    : Constants?.expoConfig?.extra?.CLOUDFRONT_URL;

  return `${cloudfrontUrl}/images/${url}`;
};

const stripTime = (dateParam: Date) => {
  return new Date(dateParam.getFullYear(), dateParam.getMonth(), dateParam.getDate());
};

export const checkIfDatesMatch = (date1: Date, date2: Date) => {
  if (stripTime(date1).getTime() === stripTime(date2).getTime()) {
    return true;
  } else {
    return false;
  }
};

export const showAlert = (type: ToastType, message: string, visibilityTime: number = 4000) => {
  Toast.show({
    text1: message,
    autoHide: true,
    text1Style: { textAlign: `center` },
    type: type,
    swipeable: true,
    visibilityTime,
  });
};

export const extractExercises = (exercises: any) => {
  if (!exercises) return [];

  return Object.keys(exercises);
};

export const foodGroupToName = (key: string = "") => {
  switch (key) {
    case `totalProtein`:
      return `חלבונים`;

    case `totalCarbs`:
      return `פחמימות`;

    case `totalFats`:
      return `שומנים`;

    case `totalVeggies`:
      return `ירקות`;
  }

  return key;
};

export const servingTypeToString = (type: string) => {
  switch (type) {
    case "spoons":
      return "כפות";
    case "grams":
      return "גרם";
    case "pieces":
      return "חתיכות";
    case "scoops":
      return "סקופים";
    case "cups":
      return "כוסות";
    case "teaSpoons":
      return "כפיות";
    case "units":
      return "יחידות";
    default:
      return type;
  }
};

export const generateUniqueId = () => Math.random().toString(36).substring(2, 9);
