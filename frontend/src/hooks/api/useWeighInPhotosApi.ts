import { useState } from "react";
import { useUserApi } from "./useUserApi";
import { useToast } from "../useToast";
import { useImageApi } from "./useImageApi";
import { useUserStore } from "@/store/userStore";
import { fetchData, sendData, updateItem } from "@/API/api";
import { ApiResponse } from "@/types/ApiTypes";

const USER_IMAGE_URLS_ENDPOINT = "userImageUrls";

export const useWeighInPhotosApi = () => {
  const { updateUserField } = useUserApi();
  const { triggerErrorToast } = useToast();
  const { currentUser } = useUserStore();

  const { handleUploadImageToS3, handleDeletePhoto } = useImageApi();
  const [uploading, setUploading] = useState<boolean>(false);

  const addImageUrl = (userId: string, imageUrl: string) => {
    return sendData<ApiResponse<string[]>>(USER_IMAGE_URLS_ENDPOINT, { userId, imageUrl });
  };

  const replaceImageUrl = (userId: string, oldImageUrl: string, newImageUrl: string) => {
    return updateItem<ApiResponse<string[]>>(`${USER_IMAGE_URLS_ENDPOINT}/one`, {
      userId,
      oldImageUrl,
      newImageUrl,
    });
  };

  const handleReplaceCycle = async (oldUrls: string[], fileUris: string[]) => {
    const userId = currentUser?._id;
    if (!userId) return;
    if (oldUrls.length !== fileUris.length) return;

    setUploading(true);
    try {
      const stamp = Date.now();
      for (let i = 0; i < fileUris.length; i += 1) {
        const oldUrl = oldUrls[i];
        const fileUri = fileUris[i];
        if (!oldUrl || !fileUri) continue;
        const imageName = `${i + 1}-${stamp}`;
        const { urlToStore } = await handleUploadImageToS3(fileUri, userId, imageName);
        if (urlToStore === oldUrl) continue;
        await replaceImageUrl(userId, oldUrl, urlToStore);
      }
    } catch (error) {
      console.error("replaceCycle failed:", error);
      triggerErrorToast({ message: "אירעה שגיאה בהחלפת התמונות!" });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const getUserImageUrls = (userId: string) => {
    return fetchData<ApiResponse<string[]>>(`${USER_IMAGE_URLS_ENDPOINT}/user`, { userId })
      .then((res) => res.data)
      .catch((error: any) => {
        if (error?.response?.status === 404 || error?.status === 404) return [] as string[];
        throw error;
      });
  };

  const handleUploadCycle = async (fileUris: string[]) => {
    const userId = currentUser?._id;
    if (!userId || !fileUris.length) return;

    setUploading(true);
    const uploadedKeys: string[] = [];
    const addedKeys: string[] = [];
    try {
      const stamp = Date.now();
      const results = await Promise.all(
        fileUris.map((fileUri, i) =>
          handleUploadImageToS3(fileUri, userId, `${i + 1}-${stamp}`).then((res) => res.urlToStore)
        )
      );
      uploadedKeys.push(...results);
      const addResults = await Promise.all(uploadedKeys.map((key) => addImageUrl(userId, key)));
      addedKeys.push(...uploadedKeys);
      if (addResults.length !== uploadedKeys.length) {
        throw new Error("Partial cycle: some images failed to register");
      }
      await updateUserField(userId, "imagesUploaded", true);
    } catch (error: any) {
      await Promise.allSettled(addedKeys.map((key) => handleDeletePhoto(key)));
      await Promise.allSettled(
        uploadedKeys
          .filter((key) => !addedKeys.includes(key))
          .map((key) => handleDeletePhoto(key))
      );
      const status = error?.response?.status ?? error?.status;
      const message =
        status === 429
          ? "כבר העלית תמונות השבוע. אפשר להעלות מחזור חדש בשבוע הבא"
          : status === 401
            ? "ההתחברות פגה. יש להתחבר מחדש"
            : "העלאת התמונות נכשלה. בדוק חיבור לרשת ונסה שוב";
      triggerErrorToast({ message });
      throw error;
    } finally {
      setUploading(false);
    }
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

  return {
    handleUpload,
    uploading,
    getUserImageUrls,
    handleReplaceCycle,
    handleUploadCycle,
  };
};
