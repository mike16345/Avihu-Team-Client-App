import { StyleSheet, View } from "react-native";
import { FC, useState } from "react";
import { Colors } from "@/constants/Colors";
import { DateRanges } from "@/types/dateTypes";
import { SegmentedButtons } from "react-native-paper";
import { useAppTheme } from "@/themes/useAppTheme";

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
  const theme = useAppTheme();
  const ranges = ["1W", "1M", "1Y"];
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);

  return (
    <View>
      <SegmentedButtons
        value={ranges[selectedRangeIndex]}
        onValueChange={(value) => {
          const index = ranges.indexOf(value);
          setSelectedRangeIndex(index);
          onRangeChange(value == "1W" ? "weeks" : value == "1M" ? "months" : "years");
        }}
        buttons={ranges.map((range) => ({
          value: range,
          label: range,
          checkedColor: theme.colors.primary,
          uncheckedColor: theme.colors.onPrimary,
        }))}
        density="regular" // Adjust density as needed
      />
    </View>
  );
};

export default ChangeRangeBtns;

const styles = StyleSheet.create({
  rangeButton: {
    backgroundColor: Colors.bgSecondary,
    color: Colors.primary,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  activeRangeBtn: {
    backgroundColor: Colors.primary,
    color: Colors.bgSecondary,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  rangeText: {
    fontWeight: "600",
    color: Colors.primary,
  },
});
