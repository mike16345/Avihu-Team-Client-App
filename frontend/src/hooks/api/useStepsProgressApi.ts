import { sendData } from "@/API/api";
import type { IStepsProgress, StepsSyncPayload } from "@/interfaces/StepsProgress";
import type { ApiResponse } from "@/types/ApiTypes";

const STEPS_PROGRESS_ENDPOINT = "steps";

export const syncStepsProgress = (payload: StepsSyncPayload) => {
  return sendData<ApiResponse<IStepsProgress>>(`${STEPS_PROGRESS_ENDPOINT}/sync`, payload).then(
    (res) => res.data
  );
};

export const useStepsProgressApi = () => {
  return {
    syncStepsProgress,
  };
};
