import { useMutation } from "@tanstack/react-query";
import { FormResponsePayload } from "@/interfaces/FormPreset";

const useAddFormResponse = () => {
  return useMutation({
    mutationFn: async (payload: FormResponsePayload) => Promise.resolve(payload),
  });
};

export default useAddFormResponse;
