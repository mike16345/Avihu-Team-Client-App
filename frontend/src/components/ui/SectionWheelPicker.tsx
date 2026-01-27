import React from "react";
import { View, StyleSheet } from "react-native";
import WheelPicker from "./WheelPicker";
import { WheelPickerProps } from "@/types/wheelPickerTypes";

export type SectionWheelPickerProps = {
  data: WheelPickerProps[];
  selectedValues: any[];
  onValueChange: (values: any[], indices: number[]) => void;
};

const SectionWheelPicker: React.FC<SectionWheelPickerProps> = ({ data, selectedValues }) => {
  return (
    <View style={[styles.container]}>
      {data.map((item, index) => (
        <View key={index}>
          <WheelPicker
            {...item}
            selectedValue={selectedValues[index]}
            onValueChange={(value) => item.onValueChange(value)}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});

export default SectionWheelPicker;
