import { fetchData } from "@/API/api";
import { FormPreset } from "@/interfaces/FormPreset";
import { ApiResponse } from "@/types/ApiTypes";

const FORM_PRESETS_ENDPOINT = "presets/forms";

export const useFormPresetsApi = () => {
  const getFormPresets = async () =>
    fetchData<ApiResponse<FormPreset[]>>(FORM_PRESETS_ENDPOINT).then((res) => res.data);

  const getFormPresetById = async (id: string) =>
    fetchData<ApiResponse<FormPreset>>(`${FORM_PRESETS_ENDPOINT}/one`, { id }).then(
      (res) => res.data
    );

  return { getFormPresets, getFormPresetById };
};
