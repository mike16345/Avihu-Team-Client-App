import Toast, { ToastType } from "react-native-toast-message";

export const testEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
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

export const extractVideoId = (url: string) => {
  return url.split("v=")[1].split("&")[0];
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
  const cloudfrontUrl = process.env.EXPO_PUBLIC_CLOUDFRONT_URL || process.env.CLOUDFRONT_URL;

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

export const showAlert = (type: ToastType, message: string) => {
  Toast.show({
    text1: message,
    autoHide: true,
    type: type,
    swipeable: true,
  });
};
