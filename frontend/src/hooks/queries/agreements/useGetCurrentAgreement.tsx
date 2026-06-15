import { isNotFoundError } from "@/API/api";
import { useAgreementApi } from "@/hooks/api/useAgreementApi";

export const useGetCurrentAgreement = () => {
  const { getCurrentAgreement } = useAgreementApi();

  const resolveAgreement = async () => {
    try {
      const agreement = await getCurrentAgreement();

      return agreement ?? null;
    } catch (error) {
      if (isNotFoundError(error)) {
        return null;
      }

      console.error("Error fetching current agreement:", error);
      return null;
    }
  };

  return { resolveAgreement };
};
