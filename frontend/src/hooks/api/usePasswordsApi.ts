import { updateItem } from "@/API/api";
import { ApiResponse } from "@/types/ApiTypes";

const PASSWORDS_API_ENDPOINT = "passwords";

export const usePasswordsApi = () => {
  const changePassword = async (email: string, newPassword: string) => {
    const response = await updateItem<ApiResponse<undefined>>(`${PASSWORDS_API_ENDPOINT}`, {
      email,
      password: newPassword,
    });

    return response;
  };

  return { changePassword };
};
