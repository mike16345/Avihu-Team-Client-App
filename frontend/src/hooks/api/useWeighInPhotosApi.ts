import { useState } from "react";
import { useUserApi } from "./useUserApi";
import { useToast } from "../useToast";
import { useImageApi } from "./useImageApi";
import { useUserStore } from "@/store/userStore";

export const useWeighInPhotosApi = () => {
  const { updateUserField } = useUserApi();
  const { triggerErrorToast } = useToast();
  const { currentUser } = useUserStore();

  const { handleUploadImageToS3 } = useImageApi();
  const [uploading, setUploading] = useState<boolean>(false);

  const handleUpload = async (fileUri: string, imageName: string) => {
    const userId = currentUser?._id;

    if (!fileUri || !userId) return;

    setUploading(true);

    try {
      await handleUploadImageToS3(fileUri, userId, imageName);
      await updateUserField(userId, "imagesUploaded", true);
    } catch (error) {
      triggerErrorToast({ message: "אירעה שגיאה בהעלאת הקבצים!" });
    } finally {
      setUploading(false);
    }
  };

  return { handleUpload, uploading };
};
