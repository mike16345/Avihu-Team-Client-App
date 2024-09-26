import { fetchData } from "@/API/api";
import { IUser } from "@/interfaces/User";

export const useUserApi = () => {
  const USER_ENDPOINT = "users/";

  const getUserById = (id: string) => {
    return fetchData<IUser>(USER_ENDPOINT + `one/`, { id });
  };

  return {
    getUserById,
  };
};
