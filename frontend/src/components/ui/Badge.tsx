import useStyles from "@/styles/useGlobalStyles";
import { View, TouchableOpacity, StyleSheet, LayoutChangeEvent } from "react-native";
import { ReactNode, useState } from "react";
import { IconName } from "@/constants/iconMap";
import { ConditionalRender } from "./ConditionalRender";
import { Text } from "./Text";
import Icon from "../Icon/Icon";

interface Badgeprops {
  showDot?: boolean;
  children: ReactNode;
  showButton?: boolean;
  buttonLabel?: string;
  buttonIcon?: IconName;
  onPress?: () => void;
  disabled?: boolean;
  alignStart?: boolean;
}

const Badge: React.FC<Badgeprops> = ({
  children,
  buttonIcon = "arrowLeft",
  buttonLabel = "לצפיה",
  onPress,
  showButton = false,
  showDot = false,
  disabled = false,
  alignStart = false,
}) => {
  const { colors, common, layout, spacing } = useStyles();

  const [badgeLength, setBadgeLength] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width !== badgeLength) {
      setBadgeLength(width);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLayout={onLayout}
      disabled={disabled}
      style={[
        colors.backgroundSurface,
        common.rounded,
        common.borderXsm,
        colors.outline,
        spacing.pdVerticalXs,
        spacing.pdHorizontalDefault,
        layout.flexRow,
        alignStart && layout.alignSelfStart,
        spacing.gapDefault,
        layout.itemsCenter,
        { position: "relative" },
      ]}
    >
      <ConditionalRender condition={showDot}>
        <View style={[styles.dot, colors.backgroundSuccess, common.roundedFull]}></View>
      </ConditionalRender>

      <ConditionalRender condition={typeof children === "string"}>
        <Text style={[colors.textPrimary, { maxWidth: badgeLength }]}>{children}</Text>
      </ConditionalRender>

      <ConditionalRender condition={typeof children !== "string"}>{children}</ConditionalRender>

      <ConditionalRender condition={showButton}>
        <View
          style={[
            styles.button,
            layout.flexRow,
            layout.itemsCenter,
            spacing.pdHorizontalXs,
            spacing.gapXs,
            common.borderXsm,
            colors.outline,
            common.roundedSm,
          ]}
        >
          <Text>{buttonLabel}</Text>
          <Icon name={buttonIcon} height={12} width={15} />
        </View>
      </ConditionalRender>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dot: { width: 8, height: 8 },
  button: { position: "absolute", right: 3 },
});

export default Badge;
