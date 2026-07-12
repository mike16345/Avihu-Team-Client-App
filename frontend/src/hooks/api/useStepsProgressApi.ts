import { useCallback } from "react";
import { sendData } from "@/API/api";
import type { IStepsProgress, StepsSyncPayload } from "@/interfaces/StepsProgress";
import type { ApiResponse } from "@/types/ApiTypes";

const STEPS_PROGRESS_ENDPOINT = "steps";

export const useStepsProgressApi = () => {
  const syncStepsProgress = useCallback((payload: StepsSyncPayload) => {
    return sendData<ApiResponse<IStepsProgress>>(`${STEPS_PROGRESS_ENDPOINT}/sync`, payload).then(
      (res) => res.data
    );
  }, []);

  return {
    syncStepsProgress,
  };
};
