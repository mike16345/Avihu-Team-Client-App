import { useState } from "react";
import { useUserApi } from "./useUserApi";
import { useToast } from "../useToast";
import { useImageApi } from "./useImageApi";
import { useUserStore } from "@/store/userStore";
import { sendData } from "@/API/api";
import { ApiResponse } from "@/types/ApiTypes";

const USER_IMAGE_URLS_ENDPOINT = "userImageUrls";

export const useWeighInPhotosApi = () => {
  const { updateUserField } = useUserApi();
  const { triggerErrorToast } = useToast();
  const { currentUser } = useUserStore();

  const { handleUploadImageToS3 } = useImageApi();
  const [uploading, setUploading] = useState<boolean>(false);

  const addImageUrl = (userId: string, imageUrl: string) => {
    return sendData<ApiResponse<string[]>>(USER_IMAGE_URLS_ENDPOINT, { userId, imageUrl });
  };

  const handleUpload = async (fileUri: string, imageName: string) => {
    const userId = currentUser?._id;

    if (!fileUri || !userId) return;

    setUploading(true);

    try {
      const { urlToStore } = await handleUploadImageToS3(fileUri, userId, imageName);
      await addImageUrl(userId, urlToStore);
      await updateUserField(userId, "imagesUploaded", true);
    } catch (error) {
      triggerErrorToast({ message: "אירעה שגיאה בהעלאת הקבצים!" });
    } finally {
      setUploading(false);
    }
  };

  return { handleUpload, uploading };
};
