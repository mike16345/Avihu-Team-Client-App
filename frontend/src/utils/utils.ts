import { useUserApi } from "@/hooks/api/useUserApi";
import { useUserStore } from "@/store/userStore";
import Toast, { ToastType } from "react-native-toast-message";

export const testEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
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

export const calculateImageUploadTitle = (usersCheckInDate: number) => {
  const { updateUserField } = useUserApi();
  const MILLIESECONDS_IN_A_DAY = 86400000;
  const timeLeft = usersCheckInDate - Date.now() - MILLIESECONDS_IN_A_DAY;

  const daysLeft = timeLeft > 0 ? Math.floor(timeLeft / MILLIESECONDS_IN_A_DAY) : 0;

  switch (daysLeft) {
    case 0:
      const currentUserId = useUserStore((store) => store.currentUser?._id);
      // updateUserField(currentUserId || ``, "imagesUploaded", false);
      return ``;
    case 1:
      return `זמין בעוד יום`;
    default:
      return `זמין בעוד ${daysLeft} ימים`;
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

export const createRetryFunction = (ignoreStatusCode: number, maxRetries: number = 3) => {
  return (failureCount: number, error: any) => {
    console.log("count ", failureCount);
    // Check if error response exists and matches the ignored status code
    if (error?.status === ignoreStatusCode) {
      return false; // Stop retrying for the specified status code
    }
    // Retry up to the specified max retries for other errors
    return failureCount < maxRetries;
  };
};
