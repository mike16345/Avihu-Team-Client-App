import NativeIcon from "@/components/Icon/NativeIcon";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

interface NoDataScreenProps {
  variant?: "dietPlan" | "workoutPlan";
  message?: string;
  refreshFunc?: () => void;
  refreshing?: boolean;
}

const NoDataScreen: React.FC<NoDataScreenProps> = ({
  variant,
  message,
  refreshFunc,
  refreshing = false,
}) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshFunc} />}
      contentContainerStyle={[layout.flex1, layout.sizeFull, layout.center, spacing.gapDefault]}
    >
      <NativeIcon
        library="Ionicons"
        name="cloud-offline-outline"
        size={110}
        style={[colors.textPrimary, spacing.pdDefault]}
      />
      <Text style={[fonts.lg, colors.textOnBackground, text.textBold]}>
        {message
          ? message
          : variant == `dietPlan`
          ? `טרם בנו לך תפריט תזונה`
          : `טרם בנו לך תוכנית אימון`}
      </Text>
    </ScrollView>
  );
};

export default NoDataScreen;
