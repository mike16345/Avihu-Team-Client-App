import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { CustomModal } from "../ui/Modal";
import useFontSize from "@/styles/useFontSize";
import useMenuItemApi from "@/hooks/useMenuItemApi";
import { IMenuItem } from "@/interfaces/DietPlan";
import MenuItem from "./MenuItem";
import useStyles from "@/styles/useGlobalStyles";

interface MenuItemModalProps {
  isOpen: boolean;
  foodGroup: string | null;
  dismiss: () => void;
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({ isOpen, foodGroup, dismiss }) => {
  const { xl } = useFontSize();
  const {colors,common,layout,spacing,text}=useStyles()
  const { getMenuItems } = useMenuItemApi();

  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);

  const changeTitle= (foodGroup: string) => {

    switch (foodGroup) {
      case 'protein':
        
        return 'חלבונים';
      case 'carbs':
        
        return 'פחמימות';
      case 'vegetables':
        
        return 'ירקות';
      case `fats`:
        
        return 'שומנים';
    }
  };

  useEffect(() => {
    if (!foodGroup) return;

    getMenuItems(foodGroup)
      .then((res) => setMenuItems(res))
      .catch((err) => console.log(err));
  }, [foodGroup]);

  return (
    <CustomModal visible={isOpen} dismissable dismissableBackButton onDismiss={dismiss}>
      <ScrollView style={[
        {backgroundColor:`black`},
        spacing.pdMd,
        colors.borderPrimary,
        common.borderDefault,
        common.roundedMd
      ]}>
        <View>
          <Text style={[
            xl,
            text.textCenter,
            text.textBold,
            colors.textPrimary,
            spacing.pdMd
          ]}>{changeTitle(foodGroup||``)}</Text>
          <View style={[
            layout.flexRowReverse,
            layout.wrap,
            layout.justifyAround,
            spacing.gapDefault
          ]}>
            {menuItems.map((menuItem) => (
              <View key={menuItem.name} style={{ maxWidth: `30%` }}>
                <MenuItem menuItem={menuItem} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </CustomModal>
  );
};



export default MenuItemModal;
