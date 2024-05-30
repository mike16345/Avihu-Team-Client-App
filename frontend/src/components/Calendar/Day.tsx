import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { DayState } from "react-native-calendars/src/types";

interface DayComponentProps {
  date: number;
  state: DayState;
  marking: { weight?: string };
  onPress: () => void;
}

const DayComponent: React.FC<DayComponentProps> = ({ date, state, marking, onPress }) => {
  const { weight } = marking;

  return (
    <TouchableOpacity
      onPress={() => {
        onPress();
      }}
      style={[styles.dayContainer, state === "today" && styles.selectedDayContainer]}
    >
      <Text style={[styles.dateText, state === "disabled" && styles.disabledText]}>{date}</Text>
      {weight && (
        <Text style={[styles.valueText, state === "disabled" && styles.disabledText]}>
          {weight}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dayContainer: {
    alignItems: "center",
    padding: 5,

    backgroundColor: Colors.bgSecondary,
    borderRadius: 5,
  },
  selectedDayContainer: {
    backgroundColor: Colors.bgPrimary,
  },
  dateText: {
    color: Colors.light,
    fontWeight: "600",
    fontSize: 16,
  },
  disabledText: {
    color: "#212529", // Colors.dark
  },
  valueText: {
    color: Colors.primary,
    fontWeight: "400",
    fontSize: 12,
    marginTop: 5,
  },
});

export default DayComponent;
