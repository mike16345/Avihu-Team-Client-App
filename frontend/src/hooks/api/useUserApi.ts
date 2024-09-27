import { fetchData } from "@/API/api";
import { IUser } from "@/interfaces/User";
import { ApiResponse } from "@/types/ApiTypes";

const USER_ENDPOINT = "users";
export const useUserApi = () => {
  const getUserById = (id: string) => {
    return fetchData<ApiResponse<IUser>>(USER_ENDPOINT + `/one`, { userId: id }).then(
      (res) => res.data
    );
  };

  return {
    getUserById,
  };
};
