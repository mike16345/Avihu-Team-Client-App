import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import NativeIcon from "../Icon/NativeIcon";
import { Text } from "../ui/Text";
import BottomDrawer from "../ui/BottomDrawer";
import CustomItemContent from "./CustomItemContent";
import { MENU_ITEMS_KEY, ONE_DAY } from "@/constants/reactQuery";
import { useQuery } from "@tanstack/react-query";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import { useUserStore } from "@/store/userStore";
import { foodGroupToName } from "@/utils/utils";

interface MenuItemTicketProps {
  quantity: number;
  foodGroup?: string;
}

const MenuItemTicket: React.FC<MenuItemTicketProps> = ({ quantity, foodGroup }) => {
  const { colors, common, layout, spacing } = useStyles();
  const [openModal, setOpenModal] = useState(false);
  const { getMenuItems } = useMenuItemApi();
  const currentUser = useUserStore((store) => store.currentUser);

  console.log(!!(foodGroup && currentUser));
  const name = foodGroupToName(foodGroup);
  const group = name == `חלבונים` ? `protein` : `carbs`;

  const { data } = useQuery({
    queryFn: () => getMenuItems(group || ``, currentUser?.dietaryType),
    queryKey: [MENU_ITEMS_KEY + group],
    enabled: !!(foodGroup && currentUser),
    staleTime: ONE_DAY,
  });

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpenModal(true)}
        style={[
          colors.background,
          common.rounded,
          layout.flexDirectionByPlatform,
          layout.itemsCenter,
          spacing.pdSm,
          spacing.gapSm,
        ]}
      >
        <NativeIcon
          size={18}
          style={[colors.textPrimary]}
          library="MaterialCommunityIcons"
          name={name == `חלבונים` ? `fish` : `baguette`}
        />
        <Text style={[colors.textOnBackground]}>{quantity}</Text>
        <Text style={[colors.textOnBackground]}>{name}</Text>
      </TouchableOpacity>
      <BottomDrawer
        onClose={() => setOpenModal(false)}
        open={openModal}
        children={
          <CustomItemContent
            extraItems={[]}
            customInstructions={data || []}
            quantity={quantity}
            foodGroup={foodGroup}
          />
        }
      />
    </>
  );
};

export default MenuItemTicket;
