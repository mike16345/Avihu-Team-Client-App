import { View } from "react-native";
import { FC, useState } from "react";
import { DateRanges } from "@/types/dateTypes";
import { SegmentedButtons } from "react-native-paper";
import { useThemeContext } from "@/themes/useAppTheme";

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
  const { theme } = useThemeContext();
  const ranges = ["1W", "1M", "1Y"];

  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);

  return (
    <View>
      <SegmentedButtons
        value={ranges[selectedRangeIndex]}
        onValueChange={(range) => {
          const index = ranges.indexOf(range);
          setSelectedRangeIndex(index);
          onRangeChange(selectedRangeToRange(range));
        }}
        buttons={ranges.map((range) => ({
          value: range,
          label: range,
          checkedColor: theme.colors.primary,
          uncheckedColor: theme.colors.onBackground,
        }))}
        density="regular"
      />
    </View>
  );
};

export default ChangeRangeBtns;
