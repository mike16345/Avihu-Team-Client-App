import { reportError } from "@/services/errorReporting/reportError";
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
      reportError(error, { operation: "useGetCurrentAgreement.resolveAgreement" });

      return null;
    }
  };

  return { resolveAgreement };
};
