import { useState } from "react";
import Toast from "react-native-toast-message";

export const useWeighInPhotosApi = () => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const fetchSignedUrl = async (url: string) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "X-Api-Key": process.env.EXPO_PUBLIC_API_AUTH_TOKEN },
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
      // Fetch the file data from the URI
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

    const url = `https://11c0iu2i43.execute-api.il-central-1.amazonaws.com/test/signedUrl?userId=${userId}&date=${today}&imageName=${imageName}`;

    setUploading(true);

    try {
      // Fetch the presigned URL
      const presignedUrl = await fetchSignedUrl(url);

      // Upload the file from the URI using the presigned URL
      await uploadImageToS3(fileUri, presignedUrl);
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

  return { handleUpload, uploading, uploadProgress };
};
