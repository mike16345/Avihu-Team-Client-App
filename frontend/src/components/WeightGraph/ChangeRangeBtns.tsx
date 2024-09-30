import { Animated, View } from "react-native";
import { FC, useState } from "react";
import { DateRanges } from "@/types/dateTypes";
import { SegmentedButtons } from "react-native-paper";
import useColors from "@/styles/useColors";
import { useSpacingStyles } from "@/styles/useSpacingStyles";
import useSlideInAnimations from "@/styles/useSlideInAnimations";

const selectedRangeToRange = (selectedRange: string) => {
  switch (selectedRange) {
    case "1W":
      return "weeks";
    case "1M":
      return "months";
    case "1Y":
      return "years";
    default:
      return "weeks";
  }
};

interface ChangeRangeProps {
  onRangeChange: (range: DateRanges) => void;
}

const ChangeRangeBtns: FC<ChangeRangeProps> = ({ onRangeChange }) => {
  const colors = useColors();
  const spacing = useSpacingStyles();
  const { slideInRightDelay100 } = useSlideInAnimations();
  const ranges = ["1W", "1M", "1Y"];

  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);

  return (
    <Animated.View style={slideInRightDelay100}>
      <SegmentedButtons
        value={ranges[selectedRangeIndex]}
        onValueChange={(range) => {
          const index = ranges.indexOf(range);

          setSelectedRangeIndex(index);
          onRangeChange(selectedRangeToRange(range));
        }}
        theme={{ roundness: 2 }}
        style={spacing.pdHorizontalSm}
        buttons={ranges.map((range) => ({
          value: range,
          label: range,
          checkedColor: colors.textPrimary.color,
          uncheckedColor: colors.textOnBackground.color,
        }))}
      />
    </Animated.View>
  );
};

export default ChangeRangeBtns;
