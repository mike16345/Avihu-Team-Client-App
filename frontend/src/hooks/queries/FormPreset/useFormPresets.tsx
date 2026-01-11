import { useQuery } from "@tanstack/react-query";
import { FORM_PRESETS_KEY } from "@/constants/reactQuery";
import { useFormPresetsApi } from "@/hooks/api/useFormPresetsApi";

const useFormPresets = () => {
  const { getFormPresets } = useFormPresetsApi();

  return useQuery({
    queryKey: [FORM_PRESETS_KEY],
    queryFn: () => getFormPresets(),
  });
};

export default useFormPresets;
