import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
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
    <View>
      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.container}
        renderItem={({ item, index }) => {
          return (
            <View>
              <WheelPicker
                {...item}
                selectedValue={selectedValues[index]}
                onValueChange={(value) => handleValueChange(index, value)}
              />
            </View>
          );
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },

  section: {
    flex: 1,
  },
});

export default SectionWheelPicker;
