import { fetchData, sendData, deleteItem, updateItem } from "@/API/api";
import { IWeighIn } from "@/interfaces/User";

const WEIGH_IN_ENDPOINT = "weighIns";

export const useWeighInApi = () => {
  const addWeighIn = (id: string, data: IWeighIn) =>
    sendData<IWeighIn>(`${WEIGH_IN_ENDPOINT}/${id}`, data);

  const updateWeighIn = (id: string, data: IWeighIn) =>
    updateItem<IWeighIn>(`${WEIGH_IN_ENDPOINT}/${id}`, data);

  const deleteWeighIn = (id: string) => deleteItem<IWeighIn>(WEIGH_IN_ENDPOINT, id);

  const getWeighInsByUserId = (userId: string) =>
    fetchData<IWeighIn[]>(`${WEIGH_IN_ENDPOINT}/${userId}`);

  return {
    addWeighIn,
    updateWeighIn,
    deleteWeighIn,
    getWeighInsByUserId,
  };
};
