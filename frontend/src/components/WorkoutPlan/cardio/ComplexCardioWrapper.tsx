import { View } from "react-native";
import React, { useEffect, useState } from "react";
import { ICardioWeek } from "@/interfaces/Workout";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import CardioExerciseContainer from "./CardioExerciseContainer";
import BottomDrawer from "@/components/ui/BottomDrawer";

interface ComplexCardioWrapperProps {
  plan: ICardioWeek[];
}

const ComplexCardioWrapper: React.FC<ComplexCardioWrapperProps> = ({ plan }) => {
  const { colors, fonts, spacing, text } = useStyles();
  const [tipsToDisplay, setTipsToDisplay] = useState<string | null>(null);

  return (
    <View style={[spacing.gapLg]}>
      {plan.map(({ week, workouts }, i) => (
        <View key={i} style={[spacing.gapDefault]}>
          <Text style={[colors.textOnBackground, text.textRight, text.textBold, fonts.lg]}>
            {week}
          </Text>
          <View style={[spacing.pdVerticalDefault, spacing.gapLg]}>
            {workouts.map((workout, i) => (
              <CardioExerciseContainer
                key={i}
                exercise={workout}
                displayTip={(tip) => setTipsToDisplay(tip)}
              />
            ))}
          </View>
        </View>
      ))}
      <BottomDrawer
        open={!!tipsToDisplay}
        children={
          <View style={[spacing.pdHorizontalDefault, spacing.gapXl]}>
            <Text style={[colors.textPrimary, text.textBold, text.textRight, fonts.xl]}>
              דגשים לאימון
            </Text>
            <Text
              style={[
                colors.textOnBackground,
                spacing.pdHorizontalDefault,
                spacing.pdVerticalXl,
                text.textRight,
              ]}
            >
              {tipsToDisplay}
            </Text>
          </View>
        }
        onClose={() => setTipsToDisplay(null)}
        heightVariant="auto"
      />
    </View>
  );
};

export default ComplexCardioWrapper;
