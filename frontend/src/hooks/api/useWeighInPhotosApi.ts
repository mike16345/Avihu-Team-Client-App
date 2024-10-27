import { RNS3 } from "react-native-aws3";
import moment from "moment";

export const useWeighInPhotosApi = () => {
  const uploadPhoto = async (userId: string, fileUri: string) => {
    // Set up date-based file path and name
    const date = moment().format("YYYY-MM-DD");
    const filename = fileUri.split("/").pop();
    const fileKey = `${userId}/${date}/${filename}`;

    const file = {
      uri: fileUri,
      name: fileKey,
      type: "image/jpeg",
    };

    const options = {
      keyPrefix: `${userId}/${date}/`, // Will create folders by userId and date
      bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
      region: process.env.EXPO_PUBLIC_REGION,
      accessKey: process.env.EXPO_PUBLIC_ACCESS_KEY,
      secretKey: process.env.EXPO_PUBLIC_SECRET_KEY,
      successActionStatus: 201,
    };

    try {
      const response = await RNS3.put(file, options);
      if (response.status === 201) {
        console.log("Successfully uploaded:", response);
      } else {
        console.error("Failed to upload:", response);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return { uploadPhoto };
};
