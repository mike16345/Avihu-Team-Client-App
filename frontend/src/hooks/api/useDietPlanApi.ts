import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IDietPlan } from "@/interfaces/DietPlan";
import { ApiResponse } from "@/types/ApiTypes";

const DIET_PLAN_ENDPOINT = "dietPlans";

export const useDietPlanApi = () => {
  const addDietPlan = (dietPlan: IDietPlan) =>
    sendData<ApiResponse<IDietPlan>>(DIET_PLAN_ENDPOINT, dietPlan).then((res) => res.data);

  const updateDietPlan = (planId: string, dietPlan: IDietPlan) =>
    updateItem<ApiResponse<IDietPlan>>(`${DIET_PLAN_ENDPOINT}/one?id=${planId}`, dietPlan).then(
      (res) => res.data
    );

  const updateDietPlanByUserId = (userID: string, dietPlan: IDietPlan) =>
    updateItem<ApiResponse<IDietPlan>>(
      `${DIET_PLAN_ENDPOINT}/one/user?id=${userID}`,
      dietPlan
    ).then((res) => res.data);

  const deleteDietPlan = (planId: string) =>
    deleteItem<ApiResponse<IDietPlan>>(`${DIET_PLAN_ENDPOINT}/one?id=${planId}`).then(
      (res) => res.data
    );

  const deleteDietPlanByUserId = (userID: string) =>
    deleteItem<ApiResponse<IDietPlan>>(`${DIET_PLAN_ENDPOINT}/one?id=${userID}`).then(
      (res) => res.data
    );

  const getDietPlanByUserId = (userID: string) =>
    fetchData<ApiResponse<IDietPlan>>(`${DIET_PLAN_ENDPOINT}/user?userId=${userID}`).then(
      (res) => res.data
    );

  const getDietPlan = (id: string) =>
    fetchData<ApiResponse<IDietPlan>>(`${DIET_PLAN_ENDPOINT}/one?id=${id}`).then((res) => res.data);

  return {
    addDietPlan,
    updateDietPlan,
    getDietPlanByUserId,
    updateDietPlanByUserId,
    deleteDietPlan,
    deleteDietPlanByUserId,
    getDietPlan,
  };
};
