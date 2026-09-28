import { fetchData, sendData } from "@/API/api";
import { IWeeklyFeedback, IWeeklyFeedbackPayload } from "@/interfaces/WeeklyFeedback";
import { ApiResponse } from "@/types/ApiTypes";

const ENDPOINT = "weeklyFeedback";

export const useWeeklyFeedbackApi = () => {
  const upsertWeeklyFeedback = async (
    _userId: string,
    payload: IWeeklyFeedbackPayload
  ): Promise<IWeeklyFeedback> => {
    const res = await sendData<ApiResponse<IWeeklyFeedback>>(ENDPOINT, payload);
    return res.data;
  };

  const getWeeklyFeedbacksForUser = async (
    userId: string,
    limit?: number
  ): Promise<IWeeklyFeedback[]> => {
    const res = await fetchData<ApiResponse<IWeeklyFeedback[]>>(
      `${ENDPOINT}/user`,
      { userId, ...(limit ? { limit } : {}) }
    );
    return res.data;
  };

  const getWeeklyFeedbackByWeek = async (
    userId: string,
    weekStart: string
  ): Promise<IWeeklyFeedback | null> => {
    try {
      const res = await fetchData<ApiResponse<IWeeklyFeedback>>(
        `${ENDPOINT}/user/week`,
        { userId, weekStart }
      );
      return res.data;
    } catch {
      return null;
    }
  };

  return { upsertWeeklyFeedback, getWeeklyFeedbacksForUser, getWeeklyFeedbackByWeek };
};
