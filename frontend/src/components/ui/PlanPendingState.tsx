import Icon from "@/components/Icon/Icon";
import useStyles from "@/styles/useGlobalStyles";
import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Card } from "./Card";
import { Text } from "./Text";

interface PlanPendingStateProps {
  buttonLabel?: string;
  description: string;
  isFetching?: boolean;
  onRefresh: () => void;
  title: string;
}

const SPIN_DURATION = 800;
const SPIN_EASING = Easing.bezier(0.25, -0.5, 0.25, 1);

const RefreshIcon: React.FC<{ isFetching: boolean }> = ({ isFetching }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!isFetching) {
      cancelAnimation(rotation);
      rotation.value = 0;
      return;
    }

    rotation.value = withRepeat(
      withTiming(1, {
        duration: SPIN_DURATION,
        easing: SPIN_EASING,
      }),
      -1
    );

    return () => {
      cancelAnimation(rotation);
    };
  }, [isFetching, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 360}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon name="loader" color="#F8F8F8" />
    </Animated.View>
  );
};

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

          <Text fontSize={16} style={[text.textCenter, colors.textOnSurfaceVariant]}>
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
        <RefreshIcon isFetching={isFetching} />
        <Text fontVariant="bold" fontSize={16} style={colors.textOnPrimary}>
          {buttonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PlanPendingState;
