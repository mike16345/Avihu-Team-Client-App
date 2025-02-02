import { Platform, ScrollView, View } from "react-native";
import React, { useEffect, useState } from "react";
import { ISimpleCardioType } from "@/interfaces/Workout";
import useStyles from "@/styles/useGlobalStyles";
import { aerobicActivities, translateWorkoutKeys } from "@/utils/cardioUtils";
import { Text } from "@/components/ui/Text";

interface SimpleCardioContainerProps {
  plan?: ISimpleCardioType;
}

const SimpleCardioContainer: React.FC<SimpleCardioContainerProps> = ({ plan }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const [values, setValues] = useState<any[] | null>(null);

  useEffect(() => {
    if (!plan) return;

    const translatedData = translateWorkoutKeys(plan);

    setValues(translatedData);
  }, [plan]);

  return (
    <View
      style={[
        colors.backgroundSecondaryContainer,
        common.rounded,
        spacing.pdDefault,
        spacing.gapLg,
      ]}
    >
      <Text
        style={[colors.textOnBackground, fonts.lg, text.textBold, text.textBold, text.textRight]}
      >
        אירובי
      </Text>
      <View style={[layout.flexRow, layout.center, spacing.gapDefault]}>
        {values?.map((val, i) => (
          <View
            style={[layout.itemsCenter, spacing.pdDefault, colors.background, common.rounded]}
            key={i}
          >
            <Text style={[colors.textOnBackground, colors.textPrimary, text.textBold]}>
              {val.title}
            </Text>
            <Text style={[colors.textOnBackground, fonts.xl, text.textBold]}>{val.value}</Text>
          </View>
        ))}
      </View>
      <View style={[colors.background, common.rounded, spacing.pdDefault]}>
        <Text style={[colors.textOnBackground, text.textRight, text.textBold]}>אופן ביצוע:</Text>
        <View
          style={[
            Platform.OS == `ios` ? layout.flexRowReverse : layout.flexRow,
            layout.justifyCenter,
            layout.wrap,
            spacing.gapDefault,
            spacing.pdDefault,
          ]}
        >
          {aerobicActivities.map((activity, i) => (
            <View
              key={i}
              style={[
                colors.backgroundSecondaryContainer,
                spacing.pdHorizontalSm,
                spacing.pdVerticalXs,
                common.rounded,
              ]}
            >
              <Text style={[colors.textOnBackground]}>{activity}</Text>
            </View>
          ))}
        </View>
      </View>
      {plan?.tips && (
        <View style={[colors.background, spacing.pdDefault, common.rounded]}>
          <Text style={[colors.textOnBackground, text.textRight, text.textBold]}>דגשים:</Text>
          <Text style={[colors.textOnBackground, text.textRight, spacing.pdDefault]}>
            {plan.tips}
          </Text>
        </View>
      )}
    </View>
  );
};

export default SimpleCardioContainer;
