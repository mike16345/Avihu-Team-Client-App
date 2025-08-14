import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import { Tabs, TabsContent, TabsList } from "../ui/Tabs";

const FoodGroupTabs = () => {
  const { getAllMenuItems } = useMenuItemApi();
  return (
    <Tabs>
      <TabsList></TabsList>
      <TabsContent></TabsContent>
    </Tabs>
  );
};

export default FoodGroupTabs;
