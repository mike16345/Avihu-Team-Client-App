import { useQuery } from "@tanstack/react-query";
import { FORM_PRESET_KEY } from "@/constants/reactQuery";
import { useFormPresetsApi } from "../api/useFormPresetsApi";

const useFormPresetById = (formId?: string) => {
  const { getFormPresetById } = useFormPresetsApi();

  return useQuery({
    queryKey: [FORM_PRESET_KEY, formId],
    queryFn: () => getFormPresetById(formId!),
    enabled: !!formId,
  });
};

export default useFormPresetById;
