import { Platform, View } from "react-native";
import React, { useEffect, useState } from "react";
import { ISimpleCardioType } from "@/interfaces/Workout";
import useStyles from "@/styles/useGlobalStyles";
import { MINS_PER_WEEK, translateWorkoutKeys } from "@/utils/cardioUtils";
import { Text } from "@/components/ui/Text";
import useCardioWorkoutQuery from "@/hooks/queries/useCardioWorkoutQuery";
import Loader from "@/components/ui/loaders/Loader";
import ErrorScreen from "@/screens/ErrorScreen";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import { Card } from "@/components/ui/Card";
import Icon from "@/components/Icon/Icon";

interface SimpleCardioContainerProps {
  plan?: ISimpleCardioType;
}

const SimpleCardioContainer: React.FC<SimpleCardioContainerProps> = ({ plan }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const [values, setValues] = useState<any[] | null>(null);

  const { data: cardioWorkouts, isError, isLoading } = useCardioWorkoutQuery();

  useEffect(() => {
    if (!plan) return;

    const translatedData = translateWorkoutKeys(plan);

    setValues(translatedData);
  }, [plan]);

  if (isError) return <ErrorScreen />;

  return (
    <View style={[common.rounded, , spacing.gapLg]}>
      <View style={[spacing.gapLg]}>
        {values?.map((val, i) => (
          <Card variant="gray" style={[layout.itemsCenter, spacing.pdDefault]} key={i}>
            <Text style={colors.textPrimary}>{val.title}</Text>

            <ConditionalRender condition={val.title == MINS_PER_WEEK}>
              <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
                <Icon name="clock" />
                <Text style={[colors.textPrimary, fonts.lg, text.textBold]}>{val.value} דקות</Text>
              </View>
            </ConditionalRender>

            <ConditionalRender condition={val.title !== MINS_PER_WEEK}>
              <Text style={[colors.textPrimary, fonts.lg, text.textBold]}>{val.value}</Text>
            </ConditionalRender>
          </Card>
        ))}

        <Card variant="gray">
          <Text style={[colors.textPrimary, text.textCenter]}>רשימת תרגילים:</Text>
          <ConditionalRender condition={cardioWorkouts}>
            <Text style={[text.textCenter, fonts.lg, text.textBold]}>
              {cardioWorkouts?.data.length}
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
                <Loader />
              </View>
            </ConditionalRender>
            <ConditionalRender condition={!isLoading}>
              {cardioWorkouts?.data.map((activity, i) => (
                <View
                  key={i}
                  style={[
                    colors.background,
                    spacing.pdHorizontalSm,
                    spacing.pdVerticalXs,
                    common.rounded,
                    common.borderXsm,
                    colors.outline,
                  ]}
                >
                  <Text style={[colors.textPrimary]}>{activity.name}</Text>
                </View>
              ))}
            </ConditionalRender>
          </View>
        </Card>
        <ConditionalRender condition={!!plan?.tips}>
          <View style={[spacing.pdDefault, colors.backgroundSecondaryContainer, common.rounded]}>
            <Text
              style={[colors.textOnBackground, colors.textPrimary, text.textCenter, text.textBold]}
            >
              דגשים
            </Text>
            <Text style={[colors.textOnBackground, text.textRight, spacing.pdDefault]}>
              {plan!.tips}
            </Text>
          </View>
        </ConditionalRender>
      </View>
    </View>
  );
};

export default SimpleCardioContainer;
