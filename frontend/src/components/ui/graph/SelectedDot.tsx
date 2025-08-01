import { View, StyleSheet } from "react-native";
import React from "react";

interface SelectedDotProps {
  x: number;
  y: number;
  index: number;
  selectedLabel: number;
}

const SelectedDot: React.FC<SelectedDotProps> = ({ index, selectedLabel, x, y }) => {
  if (selectedLabel !== index) return null;

  return <View key={index} style={[styles.selectedDot, { top: y - 9, left: x - 9 }]} />;
};

const styles = StyleSheet.create({
  selectedDot: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 12,
    backgroundColor: "#33B333",
    borderWidth: 2,
    borderColor: "#FFF",
  },
});

export default SelectedDot;
