import { View } from "react-native";
import React, { useEffect } from "react";
import { ICardioWeek } from "@/interfaces/Workout";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import CardioExerciseContainer from "./CardioExerciseContainer";

interface ComplexCardioWrapperProps {
  plan: ICardioWeek[];
}

const ComplexCardioWrapper: React.FC<ComplexCardioWrapperProps> = ({ plan }) => {
  const { colors, fonts, spacing, text } = useStyles();

  return (
    <View style={[spacing.gapLg]}>
      {plan.map(({ week, workouts }, i) => (
        <View key={i} style={[spacing.gapDefault]}>
          <Text style={[colors.textOnBackground, text.textRight, text.textBold, fonts.lg]}>
            {week}
          </Text>
          <View style={[spacing.pdVerticalDefault, spacing.gapLg]}>
            {workouts.map((workout, i) => (
              <CardioExerciseContainer key={i} exercise={workout} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

export default ComplexCardioWrapper;
