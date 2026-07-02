import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import { ICardioWorkout } from "@/interfaces/Workout";
import useStyles from "@/styles/useGlobalStyles";
import CardioExerciseContainer from "./CardioExerciseContainer";

interface CardioWeekSectionProps {
  weekName: string;
  workouts: ICardioWorkout[];
  onDisplayTip: (tip: string) => void;
}

const CardioWeekSection: React.FC<CardioWeekSectionProps> = ({
  weekName,
  workouts,
  onDisplayTip,
}) => {
  const { colors, fonts, spacing, text } = useStyles();

  return (
    <View style={spacing.gapDefault}>
      <Text style={[colors.textOnBackground, text.textRight, text.textBold, fonts.lg]}>
        {weekName}
      </Text>

      <View style={[spacing.pdVerticalDefault, spacing.gapLg]}>
        {workouts.map((workout) => (
          <CardioExerciseContainer
            key={`${weekName}-${workout.name}-${workout.cardioExercise}`}
            exercise={workout}
            displayTip={onDisplayTip}
          />
        ))}
      </View>
    </View>
  );
};

export default CardioWeekSection;
