import { WheelPickerProps } from "@/types/wheelPickerTypes";
import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Text } from "./Text";
import Loader from "./loaders/Loader";

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
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

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
    if (index == selectedIndex) return;

    scrollTimeout.current = setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: index * itemHeight,
        animated: true,
      });
    }, 800);

    setSelectedIndex(index);
    onValueChange(data[index].value);
  };

  const handleScrollEnd = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const index = returnIndex(contentOffset.y);
    if (index == selectedIndex) return;

    onValueChange(data[index].value);
    setSelectedIndex(index);
  };

  const returnIndex = (contentYOffset: any) => {
    let index = Math.round(contentYOffset / itemHeight);
    const maxIndex = data.length - 1;
    const minIndex = 0;

    if (index >= maxIndex) {
      index = maxIndex;
    } else if (index < minIndex) {
      index = minIndex;
    }

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
            </View>
          )}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          initialNumToRender={100}
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
