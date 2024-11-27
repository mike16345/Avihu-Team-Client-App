import React from "react";
import { ScrollView, View } from "react-native";
import useFontSize from "@/styles/useFontSize";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import MenuItem from "./MenuItem";
import useStyles from "@/styles/useGlobalStyles";
import Loader from "../ui/loaders/Loader";
import { useQuery } from "@tanstack/react-query";
import { MENU_ITEMS_KEY, ONE_DAY } from "@/constants/reactQuery";
import BottomDrawer from "../ui/BottomDrawer";
import { Text } from "../ui/Text";

interface MenuItemModalProps {
  isOpen: boolean;
  foodGroup: string | null;
  dismiss: () => void;
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({ isOpen, foodGroup, dismiss }) => {
  const { xl } = useFontSize();
  const { colors, common, layout, spacing, text } = useStyles();
  const { getMenuItems } = useMenuItemApi();

  const changeTitle = (foodGroup: string) => {
    switch (foodGroup) {
      case "protein":
        return "חלבונים";
      case "carbs":
        return "פחמימות";
      case "vegetables":
        return "ירקות";
      case `fats`:
        return "שומנים";
    }
  };

  const { data, isError, error, isLoading } = useQuery({
    queryFn: () => getMenuItems(foodGroup || ``),
    queryKey: [MENU_ITEMS_KEY + foodGroup],
    enabled: !!foodGroup,
    staleTime: ONE_DAY,
  });

  return (
    <BottomDrawer open={isOpen} onClose={dismiss}>
      <ScrollView style={[spacing.pdMd, spacing.pdBottomBar, { height: `80%` }]}>
        {isLoading ? (
          <Loader />
        ) : (
          <View>
            <Text style={[xl, text.textCenter, text.textBold, colors.textPrimary, spacing.pdMd]}>
              {changeTitle(foodGroup || ``)}
            </Text>
            <View
              style={[
                layout.flexRowReverse,
                layout.wrap,
                layout.itemsCenter,
                layout.justifyAround,
                spacing.gapDefault,
                spacing.pdBottomBar,
              ]}
            >
              {data?.map((menuItem) => (
                <View key={menuItem.name} style={{ width: `48%` }}>
                  <MenuItem menuItem={menuItem} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </BottomDrawer>
  );
};

export default MenuItemModal;
