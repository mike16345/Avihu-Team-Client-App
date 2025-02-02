import { Platform, View } from "react-native";
import React from "react";
import { Text } from "@/components/ui/Text";
import { ICardioWorkout } from "@/interfaces/Workout";
import useStyles from "@/styles/useGlobalStyles";

interface CardioExerciseContainerProps {
  exercise: ICardioWorkout;
}

const CardioExerciseContainer: React.FC<CardioExerciseContainerProps> = ({
  exercise: { cardioExercise, distance, name, tips, warmUpAmount },
}) => {
  const { colors, common, layout, spacing, text } = useStyles();

  return (
    <View style={[spacing.pdDefault, colors.backgroundSecondaryContainer, common.rounded]}>
      <Text style={[text.textRight, colors.textOnBackground, text.textBold]}>{name}</Text>
      <View
        style={[
          Platform.OS == `ios` ? layout.flexRowReverse : layout.flexRow,
          layout.itemsStart,
          spacing.gapDefault,
          spacing.pdDefault,
        ]}
      >
        {warmUpAmount && (
          <View style={[spacing.pdDefault, colors.background, common.rounded, { width: `30%` }]}>
            <Text style={[colors.textPrimary, text.textBold, text.textRight]}>חימום (דק')</Text>
            <Text style={[colors.textOnBackground, text.textRight, text.textBold]}>
              {warmUpAmount}
            </Text>
          </View>
        )}
        <View style={[spacing.pdDefault, colors.background, common.rounded, { width: `30%` }]}>
          <Text style={[text.textRight, colors.textPrimary, text.textBold]}>תרגיל:</Text>
          <Text style={[colors.textOnBackground, text.textRight]}>{cardioExercise}</Text>
        </View>
        <View style={[spacing.pdDefault, colors.background, common.rounded, { width: `30%` }]}>
          <Text style={[colors.textPrimary, text.textBold, text.textRight]}>מרחק (קמ')</Text>
          <Text style={[colors.textOnBackground, text.textRight, text.textBold]}>{distance}</Text>
        </View>
      </View>
      {tips && (
        <View style={[colors.background, common.rounded, spacing.pdDefault, spacing.gapDefault]}>
          <Text
            style={[colors.textOnBackground, text.textRight, colors.textPrimary, text.textBold]}
          >
            דגשים:
          </Text>
          <Text style={[text.textRight, colors.textOnBackground]}>{tips}</Text>
        </View>
      )}
    </View>
  );
};

export default CardioExerciseContainer;
