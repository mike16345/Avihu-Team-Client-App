import { sendData } from "@/API/api";
import { ApiResponse } from "@/types/ApiTypes";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { useUserApi } from "./useUserApi";
import Constants from "expo-constants";

const USER_IMAGE_URLS_ENDPOINT = "userImageUrls";

export const useWeighInPhotosApi = () => {
  const { updateUserField } = useUserApi();
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const addImageUrl = (userId: string, imageUrl: string) => {
    return sendData<ApiResponse<string[]>>(USER_IMAGE_URLS_ENDPOINT, { userId, imageUrl });
  };

  const fetchSignedUrl = async (url: string) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "X-Api-Key": process.env.EXPO_PUBLIC_API_AUTH_TOKEN || Constants.API_TOKEN },
      });
      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching signed URL:", error);
      throw new Error("Failed to fetch signed URL.");
    }
  };

  const uploadImageToS3 = async (fileUri: string, presignedUrl: string) => {
    try {
      const fileResponse = await fetch(fileUri);
      const fileBlob = await fileResponse.blob();

      const response = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": fileBlob.type || "image/jpeg",
        },
        body: fileBlob,
      });

      if (response.status === 200) {
        setUploadProgress(null);
      } else {
        console.error("Failed to upload image:", response.status, await response.text());
      }
    } catch (error) {
      Toast.show({
        text1: "אירעה שגיאה בהעלאת הקבצים!",
        autoHide: true,
        type: "error",
        swipeable: true,
      });
    }
  };

  const handleUpload = async (fileUri: string, userId: string, imageName: string) => {
    if (!fileUri) return;

    const today = new Date().toISOString().split("T")[0];
    const api = process.env.EXPO_PUBLIC_SERVER || Constants.expoConfig?.extra?.API_URL;
    const url = `${api}/signedUrl?userId=${userId}&date=${today}&imageName=${imageName}`;
    const urlToStore = `${userId}/${today}/${imageName}`;

    setUploading(true);

    try {
      // Fetch the presigned URL
      const presignedUrl = await fetchSignedUrl(url);

      // Upload the file from the URI using the presigned URL
      await uploadImageToS3(fileUri, presignedUrl);
      await addImageUrl(userId, urlToStore);
      await updateUserField(userId, "imagesUploaded", true);
    } catch (error) {
      Toast.show({
        text1: "אירעה שגיאה בהעלאת הקבצים!",
        autoHide: true,
        type: "error",
        swipeable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  return { handleUpload, addImageUrl, uploading, uploadProgress };
};
