import { sendData } from "@/API/api";
import { ApiResponse } from "@/types/ApiTypes";
import Constants from "expo-constants";

const USER_IMAGE_URLS_ENDPOINT = "userImageUrls";

export const useImageApi = () => {
  const addImageUrl = (userId: string, imageUrl: string) => {
    return sendData<ApiResponse<string[]>>(USER_IMAGE_URLS_ENDPOINT, { userId, imageUrl });
  };

  const fetchSignedUrl = async (url: string) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Api-Key":
            process.env.EXPO_PUBLIC_API_AUTH_TOKEN || Constants.expoConfig?.extra?.API_TOKEN,
        },
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

      await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": fileBlob.type || "image/jpeg",
        },
        body: fileBlob,
      });
    } catch (error) {
      throw error;
    }
  };

  const handleUploadImageToS3 = async (fileUri: string, userId: string, imageName: string) => {
    if (!fileUri) return;

    const today = new Date().toISOString().split("T")[0];
    const api = process.env.EXPO_PUBLIC_SERVER || Constants.expoConfig?.extra?.API_URL;
    const url = `${api}/signedUrl?userId=${userId}&date=${today}&imageName=${imageName}`;
    const urlToStore = `${userId}/${today}/${imageName}`;

    try {
      // Fetch the presigned URL
      const presignedUrl = await fetchSignedUrl(url);

      // Upload the file from the URI using the presigned URL
      await uploadImageToS3(fileUri, presignedUrl);
      await addImageUrl(userId, urlToStore);
    } catch (error) {
      throw error;
    }
  };

  return { handleUploadImageToS3 };
};
