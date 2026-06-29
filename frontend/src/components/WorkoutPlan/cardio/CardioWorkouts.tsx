import { View } from "react-native";
import { Card } from "@/components/ui/Card";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import SpinningIcon from "@/components/ui/loaders/SpinningIcon";
import { Text } from "@/components/ui/Text";
import useCardioWorkoutQuery from "@/hooks/queries/useCardioWorkoutQuery";
import useStyles from "@/styles/useGlobalStyles";

const CardioWorkouts = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { data: cardioWorkouts, isLoading } = useCardioWorkoutQuery();
  const workoutCount = cardioWorkouts?.data.length;

  return (
    <Card variant="gray">
      <Text style={[colors.textPrimary, text.textCenter]}>רשימת תרגילים:</Text>

      <ConditionalRender condition={typeof workoutCount === "number"}>
        <Text fontVariant="bold" style={[text.textCenter, fonts.lg]}>
          {workoutCount}
        </Text>
      </ConditionalRender>

      <View
        style={[
          layout.flexRow,
          layout.justifyCenter,
          layout.wrap,
          spacing.gapDefault,
          spacing.pdDefault,
        ]}
      >
        <ConditionalRender condition={isLoading}>
          <View style={spacing.pdDefault}>
            <SpinningIcon mode="light" />
          </View>
        </ConditionalRender>

        <ConditionalRender condition={!isLoading}>
          {cardioWorkouts?.data.map((activity) => (
            <View
              key={activity.name}
              style={[
                colors.background,
                spacing.pdHorizontalSm,
                spacing.pdVerticalXs,
                common.rounded,
                common.borderXsm,
                colors.outline,
              ]}
            >
              <Text style={colors.textPrimary}>{activity.name}</Text>
            </View>
          ))}
        </ConditionalRender>
      </View>
    </Card>
  );
};

export default CardioWorkouts;
