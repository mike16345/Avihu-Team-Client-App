import { useQuery } from "@tanstack/react-query";
import { useFormPresetsApi } from "../api/useFormPresetsApi";
import { FORM_PRESETS_KEY } from "@/constants/reactQuery";

const useFormPresets = () => {
  const { getFormPresets } = useFormPresetsApi();

  return useQuery({
    queryKey: [FORM_PRESETS_KEY],
    queryFn: () => getFormPresets(),
  });
};

export default useFormPresets;
