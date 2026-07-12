import { View } from "react-native";
import React, { useState } from "react";
import { ICardioWeek } from "@/interfaces/Workout";
import useStyles from "@/styles/useGlobalStyles";
import TipsModal from "@/components/ui/modals/TipsModal";
import CardioWeekSection from "./CardioWeekSection";

interface ComplexCardioWrapperProps {
  plan: ICardioWeek[];
}

const ComplexCardioWrapper: React.FC<ComplexCardioWrapperProps> = ({ plan }) => {
  const { spacing } = useStyles();
  const [tipsToDisplay, setTipsToDisplay] = useState<string | null>(null);

  return (
    <View style={spacing.gapLg}>
      {plan.map(({ week, workouts }) => (
        <CardioWeekSection
          key={week}
          weekName={week}
          workouts={workouts}
          onDisplayTip={setTipsToDisplay}
        />
      ))}
      <TipsModal
        title="דגשים"
        visible={!!tipsToDisplay}
        onDismiss={() => setTipsToDisplay(null)}
        tips={[tipsToDisplay || ``]}
      />
    </View>
  );
};

export default ComplexCardioWrapper;
