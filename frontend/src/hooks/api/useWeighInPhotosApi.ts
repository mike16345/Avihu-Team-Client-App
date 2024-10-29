import { sendData, updateItem } from "@/API/api";
import { ApiResponse } from "@/types/ApiTypes";
import moment from "moment";

const fetchSignedUrl = async (clientName: string, imageName: string) => {
  const url =
    process.env.EXPO_PUBLIC_SERVER + `/signedUrl?name=${clientName}&imageName=${imageName}`;

  console.log("url: " + url);
  try {
    const response = await sendData<ApiResponse<string>>(url, null).then((res) => res.data);

    return response;
  } catch (error) {
    console.error("Error fetching signed URL:", error);
    throw new Error("Failed to fetch signed URL.");
  }
};

const uploadImageToS3 = async (file: File, presignedUrl: string) => {
  try {
    console.log("file", file);
    console.log("presignedUrl", presignedUrl);
    return await updateItem<any>(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const useWeighInPhotosApi = () => {
  const uploadPhoto = async (userId: string, fileUri: string) => {
    console.log("file uri", fileUri);
    // Set up date-based file path and name
    const date = moment().format("YYYY-MM-DD");
    const filename = fileUri.split("/").pop();
    const fileKey = `${filename}`;

    const keyPrefix = `${userId}/${date}/`; // Will create folders by userId and date
    const presignedUrl = await fetchSignedUrl(userId, keyPrefix);
    const file: File = {
      uri: fileUri,
      name: fileKey,
      type: "image/jpeg",
    };

    try {
      const response = await uploadImageToS3(file, presignedUrl);
      console.log("response", response);
      if (response.status === 201) {
        console.log("Successfully uploaded:", response);
      } else {
        console.error("Status:", response.status);
        console.error("Error headers:", response.headers);
        console.error("Error message", response.text);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return { uploadPhoto };
};
