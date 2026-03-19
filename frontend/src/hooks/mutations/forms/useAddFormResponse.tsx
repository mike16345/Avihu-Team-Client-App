import { useMutation } from "@tanstack/react-query";
import { FormResponsePayload } from "@/interfaces/FormPreset";
import { useFormResponseApi } from "@/hooks/api/useFormResponseApi";

const useAddFormResponse = () => {
  const { submitFormResponse } = useFormResponseApi();

  return useMutation({
    mutationFn: async (payload: FormResponsePayload) => submitFormResponse(payload),
  });
};

export default useAddFormResponse;
