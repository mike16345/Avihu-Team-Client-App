import { deleteItem, fetchData } from "@/API/api";
import { IWeighIn, IWeighIns } from "@/interfaces/IWeighIns";

const WEIGH_INS_ENDPOINT = "weighIns/weights";

export const useWeighInsApi = () => {
  const deleteWeighIns = (userID: string) => deleteItem(WEIGH_INS_ENDPOINT, userID);

  const deleteWeighInsByUserId = (userID: string) =>
    deleteItem(WEIGH_INS_ENDPOINT + "/user", userID);

  const getWeighInsByUserId = (userID: string) =>
    fetchData<IWeighIn[]>(`${WEIGH_INS_ENDPOINT}/user/${userID}`);

  const getWeighInsById = (id: string) => fetchData<IWeighIns>(WEIGH_INS_ENDPOINT + id);

  return {
    getWeighInsByUserId,
    deleteWeighIns,
    deleteWeighInsByUserId,
    getWeighInsById,
  };
};
