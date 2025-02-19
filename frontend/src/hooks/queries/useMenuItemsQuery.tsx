import { useQuery } from "@tanstack/react-query";
import { MENU_ITEMS_KEY, ONE_DAY } from "@/constants/reactQuery";
import useMenuItemApi from "../api/useMenuItemApi";
import { useUserStore } from "@/store/userStore";
import { IMenuItem } from "@/interfaces/DietPlan";

const useFoodGroupQuery = (foodGroup: string) => {
  const { getMenuItems } = useMenuItemApi();
  const currentUser = useUserStore((state) => state.currentUser);

  return useQuery<any, any, IMenuItem[], any>({
    queryFn: () => getMenuItems(foodGroup || ``, currentUser?.dietaryType),
    queryKey: [MENU_ITEMS_KEY + foodGroup],
    enabled: !!(foodGroup && currentUser),
    staleTime: ONE_DAY,
  });
};

export default useFoodGroupQuery;
