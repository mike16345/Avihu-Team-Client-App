import useStyles from "@/styles/useGlobalStyles";
import useSlideInAnimations from "@/styles/useSlideInAnimations";
import React, { useRef } from "react";
import { Animated } from "react-native";
import AmountContainer from "./AmountContainer";
import Tips from "./Tips";
import { ScrollView } from "react-native-gesture-handler";
import useHideTabBarOnScroll from "@/hooks/useHideTabBarOnScroll";

interface ExtraInfoContainerProps {
  fats?: number;
  freeCalories?: number;
  customInstructions?: string;
}

const ExtraInfoContainer: React.FC<ExtraInfoContainerProps> = ({
  customInstructions,
  freeCalories,
  fats,
}) => {
  const { layout, spacing, colors, common, text } = useStyles();
  const { slideInRightDelay0 } = useSlideInAnimations();
  const { handleScroll } = useHideTabBarOnScroll();

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

        {Boolean(freeCalories) && <AmountContainer title="קלוריות חופשיות" amount={freeCalories} />}

        <AmountContainer title="כמות שומנים ליום" variant="gr" amount={250} />
      </Animated.View>
    </ScrollView>
  );
};

export default ExtraInfoContainer;
