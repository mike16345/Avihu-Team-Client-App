import React from "react";
import { ScrollView, Text, View } from "react-native";
import { CustomModal } from "../ui/Modal";
import useFontSize from "@/styles/useFontSize";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import MenuItem from "./MenuItem";
import useStyles from "@/styles/useGlobalStyles";
import Loader from "../ui/loaders/Loader";
import { useQuery } from "@tanstack/react-query";
import { MENU_ITEMS_KEY, ONE_DAY } from "@/constants/reactQuery";

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
    <CustomModal visible={isOpen} dismissable dismissableBackButton onDismiss={dismiss}>
      <ScrollView
        style={[
          colors.backgroundSecondaryContainer,
          spacing.pdMd,
          colors.borderPrimary,
          common.borderDefault,
          common.roundedMd,
          spacing.pdBottomBar,

          { height: `80%` },
        ]}
      >
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
                layout.justifyAround,
                layout.itemsCenter,
                spacing.gapDefault,
                spacing.pdBottomBar,
              ]}
            >
              {data?.map((menuItem) => (
                <View key={menuItem.name} style={{ maxWidth: `30%` }}>
                  <MenuItem menuItem={menuItem} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </CustomModal>
  );
};

export default MenuItemModal;
