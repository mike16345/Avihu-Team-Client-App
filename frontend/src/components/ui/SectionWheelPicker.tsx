import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import WheelPicker from "./WheelPicker";
import useColors from "@/styles/useColors";
import { SectionWheelPickerProps } from "@/types/wheelPickerTypes";

const SectionWheelPicker: React.FC<SectionWheelPickerProps> = ({
  data,
  selectedValues,
  onValueChange,
  height = 200,
  itemHeight = 40,
}) => {
  const [selectedIndices, setSelectedIndices] = useState(
    selectedValues.map((value) => data.findIndex((section) => section.data.includes(value)))
  );
  const colors = useColors();

  const handleValueChange = (sectionIndex: number, value: any) => {
    setSelectedIndices((prevIndices) => {
      const updatedIndices = [...prevIndices];

      updatedIndices[sectionIndex] = data[sectionIndex].data.indexOf(value);
      onValueChange(
        data.map((section, i) => section.data[updatedIndices[i]]),
        updatedIndices
      );
      
      return updatedIndices;
    });
  };

  return (
    <View style={[styles.container, { height }, colors.backgroundSurface]}>
      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.section, colors.outline]}>
            <WheelPicker
              data={item.data}
              selectedValue={item.data[selectedIndices[index]]}
              onValueChange={(value) => handleValueChange(index, value)}
              height={height}
              itemHeight={itemHeight}
              activeItemColor={colors.textOnBackground.color}
              inactiveItemColor={colors.textOnSurfaceDisabled.color}
            />
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    flexDirection: "row",
  },
  section: {
    flex: 1,
    borderRightWidth: 1,
  },
});

export default SectionWheelPicker;
