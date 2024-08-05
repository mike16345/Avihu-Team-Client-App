import { fetchData, sendData, updateItem, deleteItem } from '@/API/api'
import { IMenuItem } from '@/interfaces/IDietPlan'

const MENU_ITEMS_ENDPOINT = `presets/menuItems/`

const useMenuItemApi = () => {
    const getAllMenuItems = () => fetchData<IMenuItem[]>(MENU_ITEMS_ENDPOINT)

    const getMenuItems = (foodGroup: string) => fetchData<IMenuItem[]>(MENU_ITEMS_ENDPOINT + foodGroup)

    const getOneMenuItem = (foodGroup: string, id: string) => fetchData<IMenuItem>(`${MENU_ITEMS_ENDPOINT + foodGroup}/${id}`)

    const addMenuItem = (newMenuItem: IMenuItem) => sendData(MENU_ITEMS_ENDPOINT, newMenuItem)

    const editMenuItem = (newMenuItem: IMenuItem, id: string) => updateItem(MENU_ITEMS_ENDPOINT + id, newMenuItem)

    const deleteMenuItem = (id: string) => deleteItem(MENU_ITEMS_ENDPOINT, id)


    return {
        getAllMenuItems,
        getMenuItems,
        addMenuItem,
        editMenuItem,
        deleteMenuItem,
        getOneMenuItem
    }
}

export default useMenuItemApi
