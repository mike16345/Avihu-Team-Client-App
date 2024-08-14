import { fetchData } from "@/API/api";
import { IDietPlan } from "@/interfaces/DietPlan";

const DIET_PLAN_ENDPOINT = "dietPlans/";

export const useDietPlanApi = () => {
  const getDietPlanByUserId = (userID: string) =>
    fetchData<IDietPlan>(`${DIET_PLAN_ENDPOINT}user/${userID}`);

  const getDietPlan = (id: string) => fetchData<IDietPlan>(DIET_PLAN_ENDPOINT + id);

  return {
    getDietPlanByUserId,
    getDietPlan,
  };
};
