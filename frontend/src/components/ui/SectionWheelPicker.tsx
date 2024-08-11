import React from "react";
import { View, StyleSheet } from "react-native";
import WheelPicker from "./WheelPicker";
import { WheelPickerProps } from "@/types/wheelPickerTypes";

export type SectionWheelPickerProps = {
  data: WheelPickerProps[];
  selectedValues: any[];
  onValueChange: (values: any[], indices: number[]) => void;
};

const SectionWheelPicker: React.FC<SectionWheelPickerProps> = ({
  data,
  selectedValues,
  onValueChange,
}) => {
  const handleValueChange = (sectionIndex: number, value: any) => {
    try {
      const updatedValues = [...selectedValues];
      const updatedIndices = updatedValues.map((v, i) =>
        data[i].data.findIndex((item) => item.value === v)
      );

      updatedValues[sectionIndex] = value;
      updatedIndices[sectionIndex] = data[sectionIndex].data.findIndex(
        (item) => item.value === value
      );

      onValueChange(updatedValues, updatedIndices);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index}>
          <WheelPicker
            {...item}
            selectedValue={selectedValues[index]}
            onValueChange={(value) => handleValueChange(index, value)}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
});

export default SectionWheelPicker;
