import { useQuery } from "@tanstack/react-query";
import { ONE_DAY, TODAYS_GENERAL_FORM_PRESET_KEY } from "@/constants/reactQuery";
import { useFormPresetsApi } from "../../api/useFormPresetsApi";

const useGetGeneralFormForToday = (enabled: boolean) => {
  const { getGeneralFormForToday } = useFormPresetsApi();

  return useQuery({
    queryKey: [TODAYS_GENERAL_FORM_PRESET_KEY],
    queryFn: () => getGeneralFormForToday(),
    enabled,
    staleTime: ONE_DAY / 2,
  });
};

export default useGetGeneralFormForToday;
