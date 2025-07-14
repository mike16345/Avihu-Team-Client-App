import { deleteItem, fetchData, sendData } from "@/API/api";
import { ISession } from "@/interfaces/ISession";
import { ApiResponse } from "@/types/ApiTypes";

const SESSIONS_API_ENDPOINT = "sessions";

export const useSessionsApi = () => {
  const getSession = async (sessionId: string) => {
    const response = await fetchData<ApiResponse<ISession>>(
      `${SESSIONS_API_ENDPOINT}/one?sessionId=${sessionId}`
    );

    return response;
  };

  const startSession = async (session: { userId: string; type: string }) => {
    const response = await sendData(SESSIONS_API_ENDPOINT, session);

    return response;
  };

  const endSession = async (sessionId: string) => {
    const response = await deleteItem(SESSIONS_API_ENDPOINT, sessionId);

    return response;
  };

  return {
    startSession,
    endSession,
    getSession,
  };
};
