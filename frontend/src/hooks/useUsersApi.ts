import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IUser } from "@/interfaces/IUser";

const USERS_ENDPOINT = "users/";

export const useUsersApi = () => {
  const adduser = (user: IUser) => sendData<IUser>(USERS_ENDPOINT, user);

  const updateUser = (userID: string, user: IUser) =>
    updateItem(`${USERS_ENDPOINT}${userID}`, user);

  const deleteUser = (userID: string) => deleteItem(`${USERS_ENDPOINT}`, userID);

  const getuserByUserId = (userID: string) => fetchData<IUser>(`${USERS_ENDPOINT}${userID}`);

  const getUser = (id: string) => fetchData<IUser>(USERS_ENDPOINT + id);

  const getAllUsers = () => fetchData<IUser[]>(USERS_ENDPOINT);

  return {
    adduser,
    updateUser,
    getuserByUserId,
    deleteUser,
    getUser,
    getAllUsers,
  };
};
