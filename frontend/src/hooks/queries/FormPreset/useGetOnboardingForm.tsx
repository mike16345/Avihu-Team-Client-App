import { useQuery } from "@tanstack/react-query";
import { ONE_DAY, TODAYS_GENERAL_FORM_PRESET_KEY } from "@/constants/reactQuery";
import { useFormPresetsApi } from "../../api/useFormPresetsApi";

const useGetOnboardingForm = (enabled: boolean) => {
  const { getOnBoardingFormPreset } = useFormPresetsApi();

  return useQuery({
    queryKey: [TODAYS_GENERAL_FORM_PRESET_KEY],
    queryFn: () => getOnBoardingFormPreset(),
    enabled,
    staleTime: ONE_DAY,
  });
};

export default useGetOnboardingForm;
