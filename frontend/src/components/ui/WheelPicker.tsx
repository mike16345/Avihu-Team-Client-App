import { WheelPickerProps } from "@/types/wheelPickerTypes";
import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text } from "./Text";
import { softHaptic } from "@/utils/haptics";
import Animated from "react-native-reanimated";
import { FlatList } from "react-native-reanimated/lib/typescript/Animated";

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

  const flatListRef = useRef<FlatList<typeof data>>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const isProgrammatic = useRef<boolean>(false);

  const handleScroll = (event: any) => {
    if (isProgrammatic.current) return; // ✅ Skip haptics & logic

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
    }, 500);

    softHaptic();
    setSelectedIndex(index);
    onValueChange(data[index].value);
  };

  const handleScrollEnd = (event: any) => {
    if (isProgrammatic.current) isProgrammatic.current = false; // ✅ Re-enable after programmatic scroll ends

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
    isProgrammatic.current = true;
    const timeout = setTimeout(() => {
      const isDecimal = selectedValue?.toString().includes(`.`);
      let value = selectedValue;

      if (isDecimal) {
        value = selectedValue?.toString().slice(1, selectedValue.length);
      }

      const selectedIndex = data.findIndex((item) => String(item.value) == String(value));
      if (selectedIndex == -1) return;

      flatListRef.current?.scrollToIndex({ index: selectedIndex, animated: true });
    }, 250);

    return () => {
      clearTimeout(timeout);
      isProgrammatic.current = false;
    };
  }, []);

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.row}>
        <Animated.FlatList
          style={{ direction: "rtl" }}
          ref={flatListRef}
          windowSize={12}
          maxToRenderPerBatch={28}
          initialNumToRender={28}
          removeClippedSubviews={false}
          updateCellsBatchingPeriod={16}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          nestedScrollEnabled
          getItemLayout={(_, index) => ({
            length: itemHeight,
            offset: itemHeight * index,
            index,
          })}
          data={data}
          keyExtractor={(_, index) => index?.toString()}
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
                fontSize={24}
                fontVariant="brutalist"
                style={[
                  index === selectedIndex
                    ? { color: activeItemColor }
                    : { color: inactiveItemColor },
                  { direction: Platform.OS == "android" ? "ltr" : "rtl" },
                ]}
              >
                {item.value}
              </Text>
            </View>
          )}
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
