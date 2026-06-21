import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Card } from "./Card";
import { Text } from "./Text";

interface PlanPendingStateProps {
  buttonLabel?: string;
  description: string;
  isFetching?: boolean;
  onRefresh: () => void;
  title: string;
}

const PlanPendingState: React.FC<PlanPendingStateProps> = ({
  buttonLabel = "רענן",
  description,
  isFetching = false,
  onRefresh,
  title,
}) => {
  const { colors, common, layout, spacing, text } = useStyles();

  return (
    <View
      style={[
        layout.flex1,
        layout.center,
        spacing.pdStatusBar,
        spacing.pdBottomBar,
        spacing.pdLg,
        colors.background,
      ]}
    >
      <Card style={[layout.widthFull, spacing.pdLg, spacing.gapLg]} shadow={false}>
        <View style={[layout.itemsCenter, spacing.gapDefault]}>
          <Text fontVariant="bold" fontSize={24} style={[text.textCenter, colors.textPrimary]}>
            {title}
          </Text>

          <Text fontSize={16} style={[text.textCenter]}>
            {description}
          </Text>
        </View>
      </Card>

      <TouchableOpacity
        disabled={isFetching}
        onPress={onRefresh}
        style={[
          layout.flexRow,
          layout.itemsCenter,
          layout.justifyCenter,
          layout.widthFull,
          spacing.gapDefault,
          spacing.pdDefault,
          spacing.mgVerticalLg,
          common.rounded,
          colors.backgroundPrimary,
          { opacity: isFetching ? 0.8 : 1 },
        ]}
      >
        <Text fontVariant="bold" fontSize={16} style={colors.textOnPrimary}>
          {buttonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PlanPendingState;
