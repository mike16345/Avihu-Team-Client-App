import { sendData } from "@/API/api";
import { ApiResponse } from "@/types/ApiTypes";

const FORM_RESPONSES_ENDPOINT = "/presets/forms/responses";

export const useFormResponseApi = () => {
  const submitFormResponse = async (payload: any) => {
    return sendData<ApiResponse<any>>(`${FORM_RESPONSES_ENDPOINT}`, payload);
  };

  return { submitFormResponse };
};
