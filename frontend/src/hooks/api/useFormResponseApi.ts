import { fetchData, sendData } from "@/API/api";
import { IFormResponse } from "@/interfaces/IFormResponse";
import { ApiResponse } from "@/types/ApiTypes";

const FORM_RESPONSES_ENDPOINT = "/presets/forms/responses";

export const useFormResponseApi = () => {
  const submitFormResponse = async (payload: any) => {
    return sendData<ApiResponse<any>>(`${FORM_RESPONSES_ENDPOINT}`, payload);
  };

  const getFormResponses = async (query: Partial<IFormResponse>) =>
    fetchData<ApiResponse<IFormResponse[]>>(FORM_RESPONSES_ENDPOINT, query).then((res) => res.data);

  return { submitFormResponse, getFormResponses };
};
