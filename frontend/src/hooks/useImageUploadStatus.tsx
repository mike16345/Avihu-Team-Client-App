import React from "react";
import { useUserApi } from "./api/useUserApi";
import { useUserStore } from "@/store/userStore";

const useImageUploadStatus = () => {
  const { updateUserField } = useUserApi();
  const currentUser = useUserStore((store) => store.currentUser);

  const calculateImageUploadTitle = (usersCheckInDate: number) => {
    const MILLIESECONDS_IN_A_DAY = 86400000;
    const timeLeft = usersCheckInDate - Date.now();

    if (timeLeft < 0) {
      if (!currentUser?.imagesUploaded) return;

      updateUserField(currentUser?._id || ``, "imagesUploaded", false);
      return ``;
    }

    const result = Math.round(timeLeft / MILLIESECONDS_IN_A_DAY);

    const daysLeft = result == 0 ? 1 : result;

    switch (daysLeft) {
      case 1:
        return `זמין בעוד יום`;
      default:
        return `זמין בעוד ${daysLeft} ימים`;
    }
  };

  return { calculateImageUploadTitle };
};

export default useImageUploadStatus;
