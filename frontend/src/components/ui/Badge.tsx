import useStyles from "@/styles/useGlobalStyles";
import { View, TouchableOpacity, StyleSheet, LayoutChangeEvent, Dimensions } from "react-native";
import { ReactNode, useState } from "react";
import { IconName } from "@/constants/iconMap";
import { ConditionalRender } from "./ConditionalRender";
import { Text } from "./Text";
import Icon from "../Icon/Icon";
import GreenDot from "./GreenDot";

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
  buttonLabel = "לצפייה",
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
        layout.flexRow,
        alignStart && layout.alignSelfStart,
        spacing.gapDefault,
        layout.itemsCenter,
        { position: "relative", paddingHorizontal: 10, paddingVertical: 4 },
      ]}
    >
      <ConditionalRender condition={showDot}>
        <GreenDot />
      </ConditionalRender>

      <ConditionalRender condition={typeof children === "string"}>
        <Text style={[{ maxWidth: badgeLength }]}>{children}</Text>
      </ConditionalRender>

      <ConditionalRender condition={typeof children !== "string"}>{children}</ConditionalRender>

      <ConditionalRender condition={showButton}>
        <View
          style={[
            layout.flexRow,
            layout.itemsCenter,
            spacing.gapXs,
            common.borderXsm,
            colors.outline,
            common.roundedSm,
            spacing.pdHorizontalXs,
            { paddingVertical: 0.5 },
          ]}
        >
          <Text fontVariant="semibold">{buttonLabel}</Text>
          <Icon name={buttonIcon} height={12} width={15} />
        </View>
      </ConditionalRender>
    </TouchableOpacity>
  );
};

export default Badge;
