import React from "react";
import { TouchableOpacity, View } from "react-native";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import { Text } from "@/components/ui/Text";
import { ICardioWorkout } from "@/interfaces/Workout";
import useStyles from "@/styles/useGlobalStyles";

interface CardioExerciseContainerProps {
  exercise: ICardioWorkout;
  displayTip: (tip: string) => void;
}

const hasWarmupAmount = (warmUpAmount?: number) => {
  return typeof warmUpAmount === "number" && warmUpAmount >= 0;
};

const CardioExerciseContainer: React.FC<CardioExerciseContainerProps> = ({
  exercise: { cardioExercise, distance, name, tips, warmUpAmount },
  displayTip,
}) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  return (
    <View style={[spacing.pdDefault, colors.backgroundSecondaryContainer, common.rounded]}>
      <Text style={[text.textRight, colors.textPrimary, text.textBold, { padding: 0 }]}>
        {name}
      </Text>

      <View style={[layout.itemsEnd, spacing.gapDefault]}>
        <Text style={[colors.textOnBackground, text.textRight, text.textBold, fonts.xl]}>
          {cardioExercise}
        </Text>

        <View style={[layout.flexRowReverse, layout.justifyBetween, layout.widthFull]}>
          <View style={[layout.flexRowReverse, layout.itemsCenter, spacing.gapDefault]}>
            <ConditionalRender condition={hasWarmupAmount(warmUpAmount)}>
              <Text style={[colors.textOnBackground, text.textRight, text.textBold]}>
                {warmUpAmount} דק' חימום
              </Text>
            </ConditionalRender>

            <Text style={[colors.textOnBackground, text.textRight, text.textBold]}>{distance}</Text>
          </View>

          <ConditionalRender condition={!!tips}>
            <TouchableOpacity
              onPress={() => displayTip(tips!)}
              style={[colors.backgroundPrimary, common.roundedSm, spacing.pdXs]}
            >
              <Text style={colors.textOnBackground}>צפה בדגשים</Text>
            </TouchableOpacity>
          </ConditionalRender>
        </View>
      </View>
    </View>
  );
};

export default CardioExerciseContainer;
