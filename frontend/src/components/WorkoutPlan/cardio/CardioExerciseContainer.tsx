import { TouchableOpacity, View } from "react-native";
import React from "react";
import { Text } from "@/components/ui/Text";
import { ICardioWorkout } from "@/interfaces/Workout";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "@/components/ui/ConditionalRender";

interface CardioExerciseContainerProps {
  exercise: ICardioWorkout;
  displayTip: (tip: string) => void;
}

const CardioExerciseContainer: React.FC<CardioExerciseContainerProps> = ({
  exercise: { cardioExercise, distance, name, tips, warmUpAmount, exerciseMethod },
  displayTip,
}) => {
  const { colors, common, layout, spacing, text, fonts } = useStyles();

  return (
    <View style={[spacing.pdDefault, colors.backgroundSecondaryContainer, common.rounded]}>
      <Text style={[text.textRight, colors.textPrimary, text.textBold, { padding: 0 }]}>
        {name}
      </Text>
      <View style={[layout.itemsEnd, spacing.gapDefault]}>
        <Text style={[colors.textOnBackground, text.textRight, fonts.xl, text.textBold]}>
          {cardioExercise}
        </Text>
        <View style={[layout.flexRowReverse, layout.justifyBetween, layout.widthFull]}>
          <View style={[layout.flexRowReverse, spacing.gapDefault, layout.itemsCenter]}>
            <ConditionalRender condition={warmUpAmount >= 0}>
              <Text style={[colors.textOnBackground, text.textRight, text.textBold]}>
                {warmUpAmount} דק' חימום
              </Text>
            </ConditionalRender>
            <Text style={[colors.textOnBackground, text.textRight, text.textBold]}>{distance}</Text>
          </View>
          <ConditionalRender condition={!!tips}>
            <TouchableOpacity
              onPress={() => displayTip(tips!)}
              style={[
                exerciseMethod ? colors.backgroundSurfaceVariant : colors.backgroundPrimary,
                common.roundedSm,
                spacing.pdXs,
              ]}
            >
              <Text style={[colors.textOnBackground]}>צפה בדגשים</Text>
            </TouchableOpacity>
          </ConditionalRender>
        </View>
      </View>
    </View>
  );
};

export default CardioExerciseContainer;
