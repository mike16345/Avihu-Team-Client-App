import { Colors } from "@/constants/Colors";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CustomModal } from "../ui/Modal";
import useFontSize from "@/styles/useFontSize";
import useMenuItemApi from "@/hooks/useMenuItemApi";
import { IMenuItem } from "@/interfaces/DietPlan";
import MenuItem from "./MenuItem";

interface MenuItemModalProps {
  isOpen: boolean;
  foodGroup: string | null;
  dismiss: () => void;
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({ isOpen, foodGroup, dismiss }) => {
  const { xl } = useFontSize();
  const { getMenuItems } = useMenuItemApi();

  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [title, setTitle] = useState<string | null>(null);

  const changeTitle = (foodGroup: string) => {
    let title: string;
    if (foodGroup === `protein`) {
      title = `חלבונים`;
    } else if (foodGroup === `carbs`) {
      title = `פחמימות`;
    } else if (foodGroup === `vegetables`) {
      title = `ירקות`;
    } else {
      title = `שומנים`;
    }

    setTitle(title);
  };

  useEffect(() => {
    if (!foodGroup) return;
    changeTitle(foodGroup);

    getMenuItems(foodGroup)
      .then((res) => setMenuItems(res))
      .catch((err) => console.log(err));
  }, [foodGroup]);

  return (
    <CustomModal visible={isOpen} dismissable dismissableBackButton onDismiss={dismiss}>
      <ScrollView style={styles.modal}>
        <View>
          <Text style={[styles.modalHeader, xl]}>{title}</Text>
          <View style={styles.menuItemContainer}>
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

const styles = StyleSheet.create({
  modal: {
    height: `80%`,
    backgroundColor: Colors.bgSecondary,
    padding: 10,
    borderRadius: 20,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  modalHeader: {
    color: Colors.primary,
    textAlign: `center`,
    fontWeight: `bold`,
    padding: 10,
  },
  menuItemContainer: {
    display: `flex`,
    flexDirection: `row-reverse`,
    justifyContent: `space-around`,
    gap: 10,
    flexWrap: `wrap`,
  },
});

export default MenuItemModal;
