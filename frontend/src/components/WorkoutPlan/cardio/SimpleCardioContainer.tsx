import { Platform, ScrollView, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { ISimpleCardioType } from "@/interfaces/Workout";
import useStyles from "@/styles/useGlobalStyles";
import { aerobicActivities, translateWorkoutKeys } from "@/utils/cardioUtils";
import { Text } from "@/components/ui/Text";
import useCardioWorkoutQuery from "@/hooks/queries/useCardioWorkoutQuery";
import Loader from "@/components/ui/loaders/Loader";
import ErrorScreen from "@/screens/ErrorScreen";

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
      <View style={[spacing.gapDefault]}>
        {values?.map((val, i) => (
          <View
            style={[
              layout.itemsCenter,
              spacing.pdDefault,
              colors.backgroundSecondaryContainer,
              common.rounded,
            ]}
            key={i}
          >
            <Text style={[colors.textOnBackground, colors.textPrimary, text.textBold]}>
              {val.title}
            </Text>
            <Text style={[colors.textOnBackground, fonts.xl, text.textBold]}>{val.value}</Text>
          </View>
        ))}
        <View style={[colors.backgroundSecondaryContainer, common.rounded, spacing.pdDefault]}>
          <Text style={[colors.textPrimary, text.textCenter, text.textBold]}>רשימת התרגילים:</Text>
          <View
            style={[
              Platform.OS == `ios` ? layout.flexRowReverse : layout.flexRow,
              layout.justifyCenter,
              layout.wrap,
              spacing.gapDefault,
              spacing.pdDefault,
            ]}
          >
            {isLoading && (
              <View style={spacing.pdDefault}>
                <Loader />
              </View>
            )}
            {!isLoading &&
              cardioWorkouts?.data.map((activity, i) => (
                <View
                  key={i}
                  style={[
                    colors.background,
                    spacing.pdHorizontalSm,
                    spacing.pdVerticalXs,
                    common.rounded,
                  ]}
                >
                  <Text style={[colors.textOnBackground]}>{activity.name}</Text>
                </View>
              ))}
          </View>
        </View>
        {plan?.tips && (
          <View style={[spacing.pdDefault, colors.backgroundSecondaryContainer, common.rounded]}>
            <Text
              style={[colors.textOnBackground, colors.textPrimary, text.textCenter, text.textBold]}
            >
              דגשים
            </Text>
            <Text style={[colors.textOnBackground, text.textRight, spacing.pdDefault]}>
              {plan.tips}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SimpleCardioContainer;
