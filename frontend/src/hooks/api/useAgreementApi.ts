import { fetchData, sendData } from "@/API/api";
import { IAgreement, ISignedAgreement } from "@/interfaces/IFormResponse";
import { ApiResponse } from "@/types/ApiTypes";

const AGREEMENT_API_ENDPOINT = "agreements";

export const useAgreementApi = () => {
  const getCurrentAgreement = async () =>
    fetchData<ApiResponse<IAgreement>>(`${AGREEMENT_API_ENDPOINT}/current`).then((res) => res.data);

  const sendSignedAgreement = async (agreement: ISignedAgreement) =>
    sendData<ApiResponse<IAgreement>>(`${AGREEMENT_API_ENDPOINT}/sign`, agreement).then(
      (res) => res.data
    );

  return { getCurrentAgreement, sendSignedAgreement };
};
