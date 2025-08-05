import { View, StyleProp, ViewStyle } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import WheelPicker from "./WheelPicker";
import { WheelPickerProps } from "@/types/wheelPickerTypes";
import { ConditionalRender } from "./ConditionalRender";
import { Text } from "./Text";

interface RepWheelPickerProps extends WheelPickerProps {
  style?: StyleProp<ViewStyle>;
}

const RepWheelPicker: React.FC<RepWheelPickerProps> = ({
  label = "חזרות",
  style,
  height = 50,
  itemHeight = 35,
  activeItemColor,
  inactiveItemColor,
  ...props
}) => {
  const { common, spacing, fonts, text, colors } = useStyles();

  const activeColor = activeItemColor || colors.textPrimary.color;
  const inactiveColor = inactiveItemColor || colors.textPrimary.color;

  return (
    <View style={spacing.gapXl}>
      <ConditionalRender condition={typeof label == "string"}>
        <Text style={[text.textCenter, fonts.lg, text.textBold]}>{label}</Text>
      </ConditionalRender>

      <ConditionalRender condition={typeof label !== "string"}>{label}</ConditionalRender>

      <View
        style={[
          common.borderXsm,
          spacing.pdHorizontalDefault,
          spacing.pdVerticalXs,
          common.rounded,
          style,
        ]}
      >
        <WheelPicker
          height={height}
          itemHeight={itemHeight}
          activeItemColor={activeColor}
          inactiveItemColor={inactiveColor}
          {...props}
        />
      </View>
    </View>
  );
};

export default RepWheelPicker;
