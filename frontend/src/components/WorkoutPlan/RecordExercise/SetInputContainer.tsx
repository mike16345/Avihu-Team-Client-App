import { View, StyleSheet, useWindowDimensions } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import RepWheelPicker from "@/components/ui/RepWheelPicker";
import WeightWheelPicker from "@/components/WeightGraph/WeightWheelPicker";
import Icon from "@/components/Icon/Icon";
import { generateWheelPickerData } from "@/utils/utils";
import { FC, useMemo } from "react";

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

  const data = useMemo(() => generateWheelPickerData(1, 125, 1, false), []);

  const activeColor = colors.textPrimary.color;
  const inactiveColor = colors.textPrimary.color;
  const containerWidth = width * 0.9;
  const wheelPickerWidth = containerWidth / 2;

  return (
    <View
      style={[spacing.gapLg, common.roundedMd, colors.backgroundSurface, styles.inputContainer]}
    >
      <View style={[layout.center]}>
        <Icon name="arrowRoundUp" />
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
      <PrimaryButton block>עדכון</PrimaryButton>
    </View>
  );
};

export default SetInputContainer;

const styles = StyleSheet.create({
  inputContainer: {
    paddingVertical: verticalPadding,
    paddingHorizontal: horizontalPadding,
  },
});
