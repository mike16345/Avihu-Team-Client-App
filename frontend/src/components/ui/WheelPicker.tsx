import { WheelPickerProps } from "@/types/wheelPickerTypes";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text } from "./Text";
import { softHaptic } from "@/utils/haptics";
import { FlatList } from "react-native-gesture-handler";

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
    const index = returnIndex(event);

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
    }, 250);

    softHaptic();
    setSelectedIndex(index);
    onValueChange(data[index].value);
  };

  const handleScrollEnd = (event: any) => {
    const index = returnIndex(event);

    if (index == selectedIndex) return;
    onValueChange(data[index].value);
    setSelectedIndex(index);
  };

  const returnIndex = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const offsetY = contentOffset.y;
    let index = Math.round(offsetY / itemHeight);

    index = index >= data.length - 1 ? data.length - 1 : index < 0 ? 0 : index;

    return index;
  };

  const clearTimeouts = useCallback((timeouts: (NodeJS.Timeout | null)[]) => {
    for (const timeout of timeouts) {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const index = data.findIndex((i) => i.value == selectedValue);
      if (index === -1) return;

      flatListRef.current?.scrollToIndex({
        index,
        animated: false,
      });
    }, 0);

    return () => {
      clearTimeouts([timer, scrollTimeout.current]);
    };
  }, []);

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.row}>
        <FlatList
          style={{ direction: "rtl" }}
          ref={flatListRef}
          windowSize={14}
          maxToRenderPerBatch={35}
          initialNumToRender={35}
          removeClippedSubviews={false}
          updateCellsBatchingPeriod={24}
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
});

export default WheelPicker;
