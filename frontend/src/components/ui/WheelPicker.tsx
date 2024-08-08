import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from "react-native";

type WheelPickerOption = {
  value: any;
  label?: string;
};

type WheelPickerProps = {
  data: WheelPickerOption[];
  selectedValue: any;
  onValueChange: (value: any) => void;
  height?: number;
  itemHeight?: number;
  activeItemColor: string;
  inactiveItemColor: string;
  label?: string;
};

const WheelPicker: React.FC<WheelPickerProps> = ({
  data,
  selectedValue,
  onValueChange,
  height = 200,
  itemHeight = 40,
  activeItemColor,
  inactiveItemColor,
  label,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(
    data.findIndex((item) => item.value === selectedValue)
  );
  const flatListRef = useRef<FlatList>(null);

  const handleItemPress = (index: number) => {
    setSelectedIndex(index);
    onValueChange(data[index].value);
    flatListRef.current?.scrollToOffset({
      offset: index * itemHeight,
      animated: true,
    });
  };

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const index = Math.round(contentOffset.y / itemHeight);

    setSelectedIndex(index);
    onValueChange(data[index].value);
  };

  const handleScrollEnd = () => {
    flatListRef.current?.scrollToOffset({
      offset: selectedIndex * itemHeight,
      animated: true,
    });
  };

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.row}>
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.item,
                index === selectedIndex ? [styles.selectedItem] : null,
                { height: itemHeight },
              ]}
              onPress={() => handleItemPress(index)}
            >
              <Text
                style={[
                  styles.itemText,
                  index === selectedIndex ? { color: "white" } : { color: inactiveItemColor },
                ]}
              >
                {item.value}
              </Text>
            </TouchableOpacity>
          )}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: (height - itemHeight) / 2 }}
        />
        {label && (
          <View style={styles.labelContainer}>
            <Text style={[styles.labelText, { color: inactiveItemColor }]}>{label}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
  },
  selectedItem: {
    // Add your selected item styles here
  },
  itemText: {
    fontSize: 16,
  },
  labelContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  labelText: {
    fontSize: 16,
  },
});

export default WheelPicker;
