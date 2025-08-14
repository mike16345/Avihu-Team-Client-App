import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";

const useMenuItemsQuery = () => {
  const { getAllMenuItems } = useMenuItemApi();
  const dietaryRestrictions = useUserStore((state) => state.currentUser?.dietaryType || []);

  return useQuery({ queryKey: ["all-menu-items"], queryFn: getAllMenuItems });
};

export default useMenuItemsQuery;
