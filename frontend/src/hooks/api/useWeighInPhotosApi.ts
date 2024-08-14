import { deleteItem, fetchData } from "@/API/api";
import { Photo } from "@/components/UserDashboard/WeightProgression/WeightProgressionPhotos";
import axiosInstance from "@/config/apiConfig";
const WEIGH_IN_PHOTOS_ENDPOINT = "weighIns/photos/";

export const useWeighInPhotosApi = () => {
  const deleteWeighInPhotos = (userID: string) => deleteItem(WEIGH_IN_PHOTOS_ENDPOINT, userID);

  const deleteWeighInPhotosByUserId = (userID: string) =>
    deleteItem(WEIGH_IN_PHOTOS_ENDPOINT + "user", userID);

  const getWeighInPhotosByUserId = (userID: string) =>
    fetchData<Photo[]>(`${WEIGH_IN_PHOTOS_ENDPOINT}/${userID}`);

  const getWeighInPhotosById = (id: string) =>
    axiosInstance.get<Photo[]>(WEIGH_IN_PHOTOS_ENDPOINT + id);

  return {
    getWeighInPhotosByUserId,
    deleteWeighInPhotos,
    deleteWeighInPhotosByUserId,
    getWeighInPhotosById,
  };
};
