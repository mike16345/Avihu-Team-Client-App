import axios from "axios";
import { IWeeklyFeedback, IWeeklyFeedbackPayload } from "@/interfaces/WeeklyFeedback";
import { ApiResponse } from "@/types/ApiTypes";

const WEEKLY_FEEDBACK_BASE = "http://localhost:5555";
const ENDPOINT = "/weeklyFeedback";

const client = axios.create({ baseURL: WEEKLY_FEEDBACK_BASE, timeout: 15000 });

export const useWeeklyFeedbackApi = () => {
  const upsertWeeklyFeedback = async (
    userId: string,
    payload: IWeeklyFeedbackPayload
  ): Promise<IWeeklyFeedback> => {
    const res = await client.post<ApiResponse<IWeeklyFeedback>>(
      ENDPOINT,
      payload,
      { headers: { Authorization: `Bearer ${userId}` } }
    );
    return res.data.data;
  };

  const getWeeklyFeedbacksForUser = async (
    userId: string,
    limit?: number
  ): Promise<IWeeklyFeedback[]> => {
    const res = await client.get<ApiResponse<IWeeklyFeedback[]>>(
      `${ENDPOINT}/user/${userId}`,
      { params: limit ? { limit } : undefined }
    );
    return res.data.data;
  };

  const getWeeklyFeedbackByWeek = async (
    userId: string,
    weekStart: string
  ): Promise<IWeeklyFeedback | null> => {
    try {
      const res = await client.get<ApiResponse<IWeeklyFeedback>>(
        `${ENDPOINT}/user/${userId}/week/${weekStart}`
      );
      return res.data.data;
    } catch {
      return null;
    }
  };

  return { upsertWeeklyFeedback, getWeeklyFeedbacksForUser, getWeeklyFeedbackByWeek };
};
