import { MENU_ITEMS_KEY, ONE_DAY } from "@/constants/reactQuery";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";

const useMenuItemsQuery = () => {
  const { getAllMenuItems } = useMenuItemApi();
  const dietaryRestrictions = useUserStore((state) => state.currentUser?.dietaryType) || [];
  return useQuery({
    queryKey: [MENU_ITEMS_KEY],
    queryFn: () => getAllMenuItems(dietaryRestrictions),
    staleTime: ONE_DAY,
  });
};

export default useMenuItemsQuery;
