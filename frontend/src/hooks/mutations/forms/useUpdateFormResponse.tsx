import { useMutation } from "@tanstack/react-query";
import { FormResponsePayload } from "@/interfaces/FormPreset";

const useUpdateFormResponse = () => {
  return useMutation({
    mutationFn: async (payload: FormResponsePayload) => Promise.resolve(payload),
  });
};

export default useUpdateFormResponse;
