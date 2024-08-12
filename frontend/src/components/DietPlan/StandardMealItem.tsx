import React from "react";
import { StyleSheet, Text, View } from "react-native";
import NativeIcon from "../Icon/NativeIcon";
import { Colors } from "@/constants/Colors";
import { MaterialCommunityIconsNames } from "@/types/iconTypes";

interface StandardMealItemProps {
  quantity: number;
  iconName: MaterialCommunityIconsNames;
}

const StandardMealItem: React.FC<StandardMealItemProps> = ({ quantity, iconName }) => {
  return (
    <View style={styles.mealItems}>
      <NativeIcon
        library="MaterialCommunityIcons"
        name={iconName}
        size={20}
        color={Colors.primary}
      />
      <Text style={styles.mealItemsText}>חלבונים: {quantity}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mealItems: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    padding: 5,
    borderRadius: 10,
  },
  mealItemsText: {
    color: Colors.light,
  },
});

export default StandardMealItem;
