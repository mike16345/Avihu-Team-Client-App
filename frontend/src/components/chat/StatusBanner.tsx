import React from "react";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import { StatusBannerState } from "@/hooks/chat/useQuotaPause";

interface StatusBannerProps {
  banner: StatusBannerState | null;
}

const StatusBanner: React.FC<StatusBannerProps> = ({ banner }) => {
  const { colors, common, spacing, text } = useStyles();

  if (!banner) return null;

  const backgroundStyle =
    banner.variant === "quota"
      ? colors.backgroundWarningContainer
      : colors.backgroundSecondaryContainer;

  const textStyle =
    banner.variant === "quota"
      ? colors.textOnWarningContainer
      : colors.textOnSecondaryContainer;

  return (
    <View
      pointerEvents="none"
      style={[backgroundStyle, colors.outline, common.borderXsm, common.rounded, spacing.pdDefault]}
    >
      <Text fontSize={12} style={[text.textRight, textStyle, { lineHeight: 18 }]}>
        {banner.message}
      </Text>
    </View>
  );
};

export default StatusBanner;
