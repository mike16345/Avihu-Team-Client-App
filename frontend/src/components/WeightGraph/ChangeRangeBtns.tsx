import { StyleSheet, Text, View } from "react-native";
import React, { FC, useState } from "react";
import { ButtonGroup } from "react-native-elements";
import { Colors } from "../../constants/Colors";
import { DateRanges } from "../../types/dateTypes";

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
  const ranges = ["1W", "1M", "1Y"];
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);

  return (
    <View>
      <ButtonGroup
        buttons={ranges}
        selectedIndex={selectedRangeIndex}
        buttonContainerStyle={{ borderWidth: 0, paddingRight: 20 }}
        onPress={(index) => {
          setSelectedRangeIndex(index);
          onRangeChange(selectedRangeToRange(ranges[index]));
        }}
        buttonStyle={styles.rangeButton}
        selectedButtonStyle={styles.activeRangeBtn}
        textStyle={{ color: Colors.primary }}
        innerBorderStyle={{ width: 0 }}
        containerStyle={{
          width: "100%",
          gap: 4,
          height: 40,
          borderWidth: 0,
          borderRadius: 4,
          backgroundColor: "transparent",
        }}
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
