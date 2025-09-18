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
  disabled,
  ...props
}) => {
  const { common, spacing, text, colors, layout } = useStyles();

  const activeColor = activeItemColor || colors.textPrimary.color;
  const inactiveColor = inactiveItemColor || colors.textPrimary.color;

  return (
    <View style={spacing.gapXl}>
      <ConditionalRender condition={typeof label == "string" && label.length > 0}>
        <Text fontSize={20} fontVariant="semibold" style={[text.textCenter]}>
          {label}
        </Text>
      </ConditionalRender>

      <ConditionalRender condition={typeof label !== "string"}>{label}</ConditionalRender>

      <View
        style={[
          common.borderXsm,
          spacing.pdHorizontalDefault,
          spacing.pdVerticalXs,
          common.rounded,
          { opacity: disabled ? 0.4 : 1 },
          style,
        ]}
      >
        {!disabled ? (
          <WheelPicker
            height={height}
            itemHeight={itemHeight}
            activeItemColor={activeColor}
            inactiveItemColor={inactiveColor}
            {...props}
          />
        ) : (
          <View
            style={[
              layout.center,
              {
                height: height,
              },
            ]}
          >
            <Text fontVariant="brutalist" fontSize={24}>
              {props.selectedValue}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default RepWheelPicker;
