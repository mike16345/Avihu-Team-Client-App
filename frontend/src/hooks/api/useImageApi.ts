import { deleteItem } from "@/API/api";
import { applyApiKeyToHeaders } from "@/services/apiKey";
import { getApiBaseUrl } from "@/config/apiConfig";
import { uploadImageFile } from "@/services/imageUpload";
import { buildSignedImageUploadUrl, createImageObjectName } from "@/utils/imageUrls";

const S3_IMAGES_ENDPOINT = "s3/photos/one";

export const useImageApi = () => {
  const handleDeletePhoto = async (photoUrl?: string) => {
    if (!photoUrl) return Promise.reject("no photo available");

    const photoId = "images/" + photoUrl;

    return await deleteItem(S3_IMAGES_ENDPOINT, undefined, undefined, { photoId });
  };

  const handleUploadImageToS3 = async (fileUri: string, userId: string, _imageName: string) => {
    if (!fileUri) throw new Error("No file provided");

    const today = new Date().toISOString().split("T")[0];
    const api = getApiBaseUrl();
    const safeImageName = createImageObjectName();
    const url = buildSignedImageUploadUrl(api!, {
      userId,
      date: today,
      imageName: safeImageName,
    });
    const urlToStore = `${userId}/${today}/${safeImageName}`;

    const headers = applyApiKeyToHeaders(new Headers());
    const { presignedUrl } = await uploadImageFile({ fileUri, signedUrlRequest: url, headers });
    return { presignedUrl, urlToStore };
  };

  return { handleUploadImageToS3, handleDeletePhoto };
};
