import React from "react";
import { TouchableOpacity, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";

interface RadioGroupProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onChange }) => {
  const { layout, spacing, colors, common } = useStyles();

  return (
    <View style={[spacing.gapSm]}>
      {options.map((option) => {
        const isSelected = option === value;

        return (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}
          >
            <View
              style={[
                styles.radioOuter,
                common.roundedFull,
                colors.outline,
                isSelected ? colors.backgroundPrimary : colors.background,
              ]}
            >
              <View
                style={[
                  styles.radioInner,
                  common.roundedFull,
                  isSelected ? colors.backgroundSurface : colors.background,
                ]}
              />
            </View>
            <Text style={colors.textPrimary}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = {
  radioOuter: {
    height: 20,
    width: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    height: 8,
    width: 8,
  },
};

export default RadioGroup;
