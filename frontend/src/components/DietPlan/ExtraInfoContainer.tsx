import useStyles from "@/styles/useGlobalStyles";
import useSlideInAnimations from "@/styles/useSlideInAnimations";
import React from "react";
import { Animated } from "react-native";
import AmountContainer from "./AmountContainer";

import { ScrollView } from "react-native-gesture-handler";
import { ConditionalRender } from "../ui/ConditionalRender";

interface ExtraInfoContainerProps {
  veggiesPerDay?: number;
  fatsPerDay?: number;
  freeCalories?: number;
  customInstructions?: string[];
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
        {/*     <ConditionalRender condition={customInstructions && customInstructions?.length > 0}>
        </ConditionalRender> */}

        <ConditionalRender condition={!!freeCalories}>
          <AmountContainer title="קלוריות חופשיות" variant="קל" amount={freeCalories} />
        </ConditionalRender>

        <ConditionalRender condition={!!fatsPerDay}>
          <AmountContainer title="מנות שומן יומי" variant="מנות" amount={fatsPerDay} />
        </ConditionalRender>

        <ConditionalRender condition={!!veggiesPerDay}>
          <AmountContainer title="כמות ירקות ליום" variant="יח '" amount={veggiesPerDay} />
        </ConditionalRender>
      </Animated.View>
    </ScrollView>
  );
};

export default ExtraInfoContainer;
