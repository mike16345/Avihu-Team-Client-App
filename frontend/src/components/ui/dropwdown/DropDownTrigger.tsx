import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import PrimaryButton from "../buttons/PrimaryButton";
import useStyles from "@/styles/useGlobalStyles";
import { useDropwDownContext } from "@/context/useDropdown";
import Icon from "@/components/Icon/Icon";

const DropDownTrigger = () => {
  const { colors, common, layout, spacing } = useStyles();

  const { setShouldCollapse, shouldCollapse, selectedValue, items } = useDropwDownContext();

  const [label, setLabel] = useState(items.length == 0 ? "בחר" : items[0].label);

  useEffect(() => {
    if (!selectedValue) return;

    const selected = items.find((items) => items.value == selectedValue);

    setLabel(selected?.label || "בחר");
  }, [selectedValue]);

  return (
    <PrimaryButton mode="light" block onPress={() => setShouldCollapse(!shouldCollapse)}>
      <View
        style={[
          layout.flexRow,
          layout.itemsCenter,
          spacing.gapDefault,
          layout.alignSelfStart,
          layout.widthFull,
          layout.justifyBetween,
        ]}
      >
        <View style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}>
          <View
            style={[
              {
                height: 8,
                width: 8,
              },
              colors.backgroundSuccess,
              common.roundedFull,
            ]}
          ></View>
          <Text>{label}</Text>
        </View>

        <Icon name="chevronDown" />
      </View>
    </PrimaryButton>
  );
};

export default DropDownTrigger;
