import { useQuery } from "@tanstack/react-query";
import { FORM_PRESETS_KEY } from "@/constants/reactQuery";
import { useFormPresetsApi } from "@/hooks/api/useFormPresetsApi";

const useFormPresets = (enabled?: boolean) => {
  const { getFormPresets } = useFormPresetsApi();

  return useQuery({
    queryKey: [FORM_PRESETS_KEY],
    queryFn: () => getFormPresets(),
    enabled: enabled ?? true,
  });
};

export default useFormPresets;
