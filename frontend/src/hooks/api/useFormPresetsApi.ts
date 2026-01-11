import { fetchData } from "@/API/api";
import { FormPreset } from "@/interfaces/FormPreset";
import { ApiResponse } from "@/types/ApiTypes";
import DateUtils from "@/utils/dateUtils";

const FORM_PRESETS_ENDPOINT = "presets/forms";

export const useFormPresetsApi = () => {
  const getFormPresets = async () =>
    fetchData<ApiResponse<FormPreset[]>>(FORM_PRESETS_ENDPOINT).then((res) => res.data);

  const getFormPresetById = async (id: string) =>
    fetchData<ApiResponse<FormPreset>>(`${FORM_PRESETS_ENDPOINT}/one`, { id }).then(
      (res) => res.data
    );

  const getOneFormPreset = async (query: Partial<FormPreset>) =>
    fetchData<ApiResponse<FormPreset>>(`${FORM_PRESETS_ENDPOINT}/forms/one`, query).then(
      (res) => res.data
    );

  const getOnBoardingFormPreset = async () =>
    fetchData<ApiResponse<FormPreset>>(`${FORM_PRESETS_ENDPOINT}/forms/one`, {
      type: "onboarding",
    }).then((res) => res.data);

  const getGeneralFormForToday = async () =>
    fetchData<ApiResponse<FormPreset>>(`${FORM_PRESETS_ENDPOINT}/forms/one`, {
      type: "general",
      showOn: DateUtils.formatDate(new Date(), "YYYY-MM-DD"),
    }).then((res) => res.data);

  return {
    getFormPresets,
    getFormPresetById,
    getOneFormPreset,
    getOnBoardingFormPreset,
    getGeneralFormForToday,
  };
};
