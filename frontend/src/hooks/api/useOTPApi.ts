import { sendData } from "@/API/api";
import { ApiResponse } from "@/types/ApiTypes";

const OTP_API_ENDPOINT = "otp";

export const useOTPApi = () => {
  const getOTP = async (email: string) => {
    const response = await sendData<ApiResponse<undefined>>(`${OTP_API_ENDPOINT}`, { email });

    return response;
  };

  const validateOTP = async (email: string, otp: string) => {
    const response = await sendData<ApiResponse<{ changePasswordSessionId: string }>>(
      `${OTP_API_ENDPOINT}/validate`,
      {
        email,
        otp,
      }
    );

    return response;
  };

  return {
    getOTP,
    validateOTP,
  };
};
