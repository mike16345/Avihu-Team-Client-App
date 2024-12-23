import { WheelPickerProps } from "@/types/wheelPickerTypes";
import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Text } from "./Text";

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
    data.findIndex((item) => String(item.value) == String(selectedValue))
  );
  const flatListRef = useRef<FlatList>(null);

  /*  const handleItemPress = (index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * itemHeight,
      animated: true,
    });

    setSelectedIndex(index);
    onValueChange(data[index].value);
  }; */

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const index = returnIndex(contentOffset.y);

    setSelectedIndex(index);
  };

  const handleScrollEnd = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const index = returnIndex(contentOffset.y);

    flatListRef.current?.scrollToOffset({
      offset: index * itemHeight,
      animated: true,
    });

    onValueChange(data[index].value);
    setSelectedIndex(selectedIndex);
  };

  const returnIndex = (contentYOffset: any) => {
    let index = Math.round(contentYOffset / itemHeight);

    index = index >= data.length - 1 ? data.length - 1 : index < 0 ? 0 : index;

    return index;
  };

  useEffect(() => {
    const selectedIndex = data.findIndex((item) => String(item.value) == String(selectedValue));
    if (selectedIndex == -1) return;

    flatListRef.current?.scrollToIndex({ index: selectedIndex });
  }, []);

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.row}>
        <FlatList
          ref={flatListRef}
          getItemLayout={(_, index) => ({
            length: itemHeight,
            offset: itemHeight * index,
            index,
          })}
          data={data}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.item,
                index === selectedIndex ? [styles.selectedItem] : null,
                { height: itemHeight, paddingHorizontal: 20 },
              ]}
              //onPress={() => handleItemPress(index)}
            >
              <Text
                style={[
                  styles.itemText,
                  index === selectedIndex
                    ? { color: activeItemColor }
                    : { color: inactiveItemColor },
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
        {label && <Text style={[styles.labelText, { color: inactiveItemColor }]}>{label}</Text>}
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
    fontSize: 24,
  },
  labelContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    fontSize: 18,
    marginLeft: 8,
  },
});

export default WheelPicker;
