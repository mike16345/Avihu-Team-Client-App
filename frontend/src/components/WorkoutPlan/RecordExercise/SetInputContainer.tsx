import { View, StyleSheet, useWindowDimensions, Pressable } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import RepWheelPicker from "@/components/ui/RepWheelPicker";
import WeightWheelPicker from "@/components/WeightGraph/WeightWheelPicker";
import Icon from "@/components/Icon/Icon";
import { generateWheelPickerData } from "@/utils/utils";
import { FC, useMemo, useState } from "react";
import BottomSheetModal from "@/components/ui/modals/BottomSheetModal";
import Animated, { LinearTransition, FadeInDown, FadeOutUp } from "react-native-reanimated";

const horizontalPadding = 24;
const verticalPadding = 16;

interface SetInputContainerProps {
  reps: number;
  weight: number;
  handleUpdateWeight: (weight: number) => void;
  handleUpdateReps: (reps: number) => void;
}

const SetInputContainer: FC<SetInputContainerProps> = ({
  reps,
  weight,
  handleUpdateReps,
  handleUpdateWeight,
}) => {
  const { width } = useWindowDimensions();
  const { layout, colors, spacing, common } = useStyles();

  const [isExpanded, setIsExpanded] = useState(false);

  const data = useMemo(() => generateWheelPickerData(1, 125, 1, false), []);

  const activeColor = colors.textPrimary.color;
  const inactiveColor = colors.textPrimary.color;
  const containerWidth = width * 0.9;
  const wheelPickerWidth = containerWidth / 2;

  return (
    <BottomSheetModal
      onOpenChange={(isExpanded) => setIsExpanded(isExpanded)}
      visible={isExpanded}
      onClose={() => setIsExpanded(false)}
    >
      <View
        style={[
          layout.flex1,
          isExpanded ? layout.justifyBetween : spacing.gapLg,
          common.roundedMd,
          colors.backgroundSurface,
          styles.inputContainer,
        ]}
      >
        <View style={[spacing.gapLg]}>
          <View style={[layout.center]}>
            <Pressable onPress={() => setIsExpanded((expanded) => !expanded)}>
              <Icon name={isExpanded ? "arrowRoundDown" : "arrowRoundUp"} />
            </Pressable>
          </View>
          <View style={[layout.flexRow, layout.center, spacing.gapXl]}>
            <WeightWheelPicker
              activeItemColor={activeColor}
              inactiveItemColor={inactiveColor}
              selectedWeight={weight}
              onValueChange={(weight) => handleUpdateWeight(weight)}
              minWeight={1}
              decimalStepSize={25}
              showZeroDecimal={true}
              decimalRange={100}
              maxWeight={500}
              height={50}
              stepSize={1}
              label="משקל"
              style={{ width: wheelPickerWidth - horizontalPadding }}
            />
            <RepWheelPicker
              data={data}
              onValueChange={(val) => handleUpdateReps(val)}
              selectedValue={reps}
              style={{ width: wheelPickerWidth - (horizontalPadding + horizontalPadding / 2) }}
            />
          </View>
          {isExpanded && (
            <Animated.View
              layout={LinearTransition.springify().damping(18).stiffness(180)}
              entering={FadeInDown.duration(160)}
              exiting={FadeOutUp.duration(140)}
            >
              <PrimaryButton block mode="light">
                הוספת משקל
              </PrimaryButton>
            </Animated.View>
          )}
        </View>
        <Animated.View layout={LinearTransition.springify().damping(18).stiffness(180)}>
          <PrimaryButton block>עדכון</PrimaryButton>
        </Animated.View>
      </View>
    </BottomSheetModal>
  );
};

export default SetInputContainer;

const styles = StyleSheet.create({
  inputContainer: {
    paddingVertical: verticalPadding,
    paddingHorizontal: horizontalPadding,
  },
});
