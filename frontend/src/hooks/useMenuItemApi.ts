import { fetchData, sendData, updateItem, deleteItem } from "@/API/api";
import { CustomItems } from "@/interfaces/DietPlan";
import { IMenuItem } from "@/interfaces/DietPlan";
import { ApiResponse } from "@/types/ApiTypes";

const MENU_ITEMS_ENDPOINT = `menuItems`;

const useMenuItemApi = () => {
  const getAllMenuItems = () =>
    fetchData<ApiResponse<CustomItems>>(MENU_ITEMS_ENDPOINT).then((res) => res.data);

  const getMenuItems = (foodGroup: string) =>
    fetchData<ApiResponse<IMenuItem[]>>(MENU_ITEMS_ENDPOINT + `/foodGroup`, { foodGroup }).then(
      (res) => res.data
    );

  const getOneMenuItem = (id: string) =>
    fetchData<ApiResponse<IMenuItem>>(`${MENU_ITEMS_ENDPOINT}/one`, { id }).then((res) => res.data);

  const addMenuItem = (newMenuItem: IMenuItem) => sendData(MENU_ITEMS_ENDPOINT, newMenuItem);

  const editMenuItem = (newMenuItem: IMenuItem, id: string) =>
    updateItem(MENU_ITEMS_ENDPOINT + `/one`, newMenuItem, null, { id });

  const deleteMenuItem = (id: string) => deleteItem(MENU_ITEMS_ENDPOINT + `/one`, { id });

  return {
    getAllMenuItems,
    getMenuItems,
    addMenuItem,
    editMenuItem,
    deleteMenuItem,
    getOneMenuItem,
  };
};

export default useMenuItemApi;
