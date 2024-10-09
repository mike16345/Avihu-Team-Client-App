import React from "react";
import { View, ViewStyle } from "react-native";
import { withTheme } from "react-native-paper";

interface DividerProps {
  color?: string;
  thickness?: number;
  orientation?: "horizontal" | "vertical";
  style?: ViewStyle;
}

const Divider: React.FC<DividerProps & { theme: any }> = ({
  color,
  thickness = 0.2,
  orientation = "horizontal",
  style,
  theme,
}) => {
  const dividerColor = color || theme.colors.onPrimary;

  const dividerStyle: ViewStyle = {
    borderWidth: thickness,
    borderStyle: "solid",
    backgroundColor: dividerColor,
    borderColor: dividerColor,
    ...(orientation === "horizontal"
      ? { height: thickness, width: "100%" }
      : { width: thickness, height: "100%" }),
    ...style,
  };

  return <View style={dividerStyle} />;
};

export default withTheme(Divider);
