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
import { useUserStore } from "@/store/userStore";
import NoDataScreen from "@/screens/NoDataScreen";
import ErrorScreen from "@/screens/ErrorScreen";

interface MenuItemModalProps {
  foodGroup: string | null;
  dismiss: () => void;
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({ foodGroup, dismiss }) => {
  const { xl } = useFontSize();
  const { colors, layout, spacing, text } = useStyles();
  const { getMenuItems } = useMenuItemApi();
  const currentUser = useUserStore((store) => store.currentUser);

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
    queryFn: () => getMenuItems(foodGroup || ``, currentUser?.dietaryType),
    queryKey: [MENU_ITEMS_KEY + foodGroup],
    enabled: !!(foodGroup && currentUser),
    staleTime: ONE_DAY,
  });

  if (isError) return <ErrorScreen error={error.message} />;

  return (
    <BottomDrawer open={Boolean(foodGroup)} onClose={dismiss}>
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
              {data && data?.length > 0 ? (
                data?.map((menuItem) => (
                  <View key={menuItem.name} style={{ width: `48%` }}>
                    <MenuItem menuItem={menuItem} />
                  </View>
                ))
              ) : (
                <NoDataScreen message="לא נמצאו פריטים!" />
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </BottomDrawer>
  );
};

export default MenuItemModal;
