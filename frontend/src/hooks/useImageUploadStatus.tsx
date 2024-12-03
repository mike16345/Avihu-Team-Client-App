import React from "react";
import { useUserApi } from "./api/useUserApi";
import { useUserStore } from "@/store/userStore";

const useImageUploadStatus = () => {
  const { updateUserField } = useUserApi();
  const currentUserId = useUserStore((store) => store.currentUser?._id);

  const calculateImageUploadTitle = (usersCheckInDate: number) => {
    const MILLIESECONDS_IN_A_DAY = 86400000;
    const timeLeft = usersCheckInDate - Date.now() - MILLIESECONDS_IN_A_DAY;

    const daysLeft = timeLeft > 0 ? Math.floor(timeLeft / MILLIESECONDS_IN_A_DAY) : 0;

    switch (daysLeft) {
      case 0:
        updateUserField(currentUserId || ``, "imagesUploaded", false);
        return ``;
      case 1:
        return `זמין בעוד יום`;
      default:
        return `זמין בעוד ${daysLeft} ימים`;
    }
  };

  return { calculateImageUploadTitle };
};

export default useImageUploadStatus;
