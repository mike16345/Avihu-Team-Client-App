import { useQuery } from "@tanstack/react-query";
import { useFormResponseApi } from "@/hooks/api/useFormResponseApi";
import { IFormResponse } from "@/interfaces/IFormResponse";
import { ONE_HOUR } from "@/constants/reactQuery";

const FORM_RESPONSES_KEY = "form-responses";

const useFormResponses = (
  query: Partial<IFormResponse>,
  options?: { enabled?: boolean }
) => {
  const { getFormResponses } = useFormResponseApi();

  return useQuery({
    queryKey: [FORM_RESPONSES_KEY, query],
    queryFn: () => getFormResponses(query),
    enabled: options?.enabled ?? true,
    staleTime: ONE_HOUR,
  });
};

export default useFormResponses;
