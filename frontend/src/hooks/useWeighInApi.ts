import { fetchData, sendData, deleteItem, updateItem } from "@/API/api";
import { IWeighIn, IWeighInResponse } from "@/interfaces/User";

const WEIGH_INS_ENDPOINT = "weighIns/weights";

export const useWeighInApi = () => {
  const addWeighIn = (id: string, data: IWeighIn) =>
    sendData<IWeighInResponse>(`${WEIGH_INS_ENDPOINT}${id}`, data);

  const updateWeighIn = (id: string, data: IWeighIn) =>
    updateItem<IWeighIn>(`${WEIGH_INS_ENDPOINT}${id}`, data);

  const deleteWeighIn = (id: string) => deleteItem<IWeighIn>(WEIGH_INS_ENDPOINT, id);

  const getWeighInsByUserId = (userID: string) =>
    fetchData<IWeighIn[]>(`${WEIGH_INS_ENDPOINT}/user/${userID}`);

  const getWeighInsById = (id: string) => fetchData<IWeighInResponse>(WEIGH_INS_ENDPOINT + id);

  const deleteWeighInsByUserId = (userID: string) =>
    deleteItem(WEIGH_INS_ENDPOINT + "/user", userID);

  const deleteWeighIns = (userID: string) => deleteItem(WEIGH_INS_ENDPOINT, userID);

  return {
    addWeighIn,
    getWeighInsById,
    updateWeighIn,
    deleteWeighIn,
    deleteWeighInsByUserId,
    getWeighInsByUserId,
    deleteWeighIns,
  };
};
