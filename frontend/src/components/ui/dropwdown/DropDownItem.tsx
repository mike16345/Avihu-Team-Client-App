import { TouchableOpacity, View } from "react-native";
import React from "react";
import { Text } from "../Text";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ConditionalRender";
import Icon from "@/components/Icon/Icon";
import { ItemType } from "react-native-dropdown-picker";

interface DropDownItemProps {
  item: ItemType<any>;
  handlePress: (value: any) => void;
  isSelected: boolean;
}

const DropDownItem: React.FC<DropDownItemProps> = ({
  item: { label, value },
  handlePress,
  isSelected,
}) => {
  const { colors, common, layout, spacing } = useStyles();

  return (
    <TouchableOpacity
      onPress={() => handlePress(value)}
      style={[{ padding: 10 }, layout.flexRow, layout.justifyBetween]}
    >
      <View style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}>
        <View style={[{ height: 8, width: 8 }, colors.backgroundSuccess, common.roundedFull]} />
        <Text>{label}</Text>
      </View>

      <ConditionalRender condition={isSelected}>
        <Icon name="check" />
      </ConditionalRender>
    </TouchableOpacity>
  );
};

export default DropDownItem;
