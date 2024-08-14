import { fetchData } from "@/API/api";
import { IUser } from "@/interfaces/User";

const USER_ENDPOINT = "users/";

export const useUserApi = () => {
  const getUserById = (id: string) => {
    return fetchData<IUser>(USER_ENDPOINT + id);
  };

  return {
    getUserById,
  };
};
