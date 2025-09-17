import { WheelPickerProps } from "@/types/wheelPickerTypes";
import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text } from "./Text";
import { softHaptic } from "@/utils/haptics";

const WheelPicker: React.FC<WheelPickerProps> = ({
  data,
  selectedValue,
  onValueChange,
  height = 200,
  itemHeight = 40,
  activeItemColor,
  inactiveItemColor,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(
    data.findIndex((item) => String(item.value) == String(selectedValue))
  );

  const flatListRef = useRef<FlatList>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const index = returnIndex(contentOffset.y);
    if (index == selectedIndex) return;
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: index * itemHeight,
        animated: true,
      });

      softHaptic();
    }, 2000); // Triggers after 2 seconds of no scroll

    softHaptic();
    setSelectedIndex(index);
    onValueChange(data[index].value);
  };

  const handleScrollEnd = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const index = returnIndex(contentOffset.y);
    if (index == selectedIndex) return;

    onValueChange(data[index].value);
    setSelectedIndex(selectedIndex);
  };

  const returnIndex = (contentYOffset: any) => {
    let index = Math.round(contentYOffset / itemHeight);

    index = index >= data.length - 1 ? data.length - 1 : index < 0 ? 0 : index;

    return index;
  };

  useEffect(() => {
    setTimeout(() => {
      const isDecimal = selectedValue.toString().includes(`.`);
      let value = selectedValue;
      if (isDecimal) {
        value = selectedValue.toString().slice(1, selectedValue.length);
      }

      const selectedIndex = data.findIndex((item) => String(item.value) == String(value));
      if (selectedIndex == -1) return;

      flatListRef.current?.scrollToIndex({ index: selectedIndex });
    }, 100);
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
            <View
              style={[
                styles.item,
                index === selectedIndex ? [styles.selectedItem] : null,
                {
                  height: itemHeight,
                },
              ]}
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
            </View>
          )}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          initialNumToRender={50}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: (height - itemHeight) / 2 }}
        />
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
    fontFamily: "Brutalist",
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
