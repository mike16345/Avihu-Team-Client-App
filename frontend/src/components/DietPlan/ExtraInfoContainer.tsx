import useStyles from "@/styles/useGlobalStyles";
import useSlideInAnimations from "@/styles/useSlideInAnimations";
import React from "react";
import { Animated } from "react-native";
import AmountContainer from "./AmountContainer";
import Tips from "./Tips";
import { ScrollView } from "react-native-gesture-handler";

interface ExtraInfoContainerProps {
  veggiesPerDay?: number;
  fatsPerDay?: number;
  freeCalories?: number;
  customInstructions?: string;
}

const ExtraInfoContainer: React.FC<ExtraInfoContainerProps> = ({
  customInstructions,
  freeCalories,
  fatsPerDay,
  veggiesPerDay,
}) => {
  const { layout, spacing } = useStyles();
  const { slideInRightDelay0 } = useSlideInAnimations();

  return (
    <ScrollView horizontal>
      <Animated.View
        style={[
          layout.flexRowReverse,
          layout.justifyBetween,
          spacing.gapLg,
          slideInRightDelay0,
          { direction: `ltr` },
        ]}
      >
        {customInstructions && <Tips tips={customInstructions} />}

        {Boolean(freeCalories) && (
          <AmountContainer title="קלוריות חופשיות" variant="cal" amount={freeCalories} />
        )}

        {fatsPerDay && (
          <AmountContainer title="כמות שומנים ליום" variant="gr" amount={fatsPerDay} />
        )}

        {veggiesPerDay && (
          <AmountContainer title="כמות ירקות ליום" variant="unit" amount={veggiesPerDay} />
        )}
      </Animated.View>
    </ScrollView>
  );
};

export default ExtraInfoContainer;
