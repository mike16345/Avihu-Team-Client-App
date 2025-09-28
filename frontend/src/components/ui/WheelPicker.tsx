import { WheelPickerProps } from "@/types/wheelPickerTypes";
import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { softHaptic } from "@/utils/haptics";
import Animated from "react-native-reanimated";

const WheelPicker: React.FC<WheelPickerProps> = ({
  data,
  selectedValue,
  onValueChange,
  onValueCommit,
  throttleMs = 80,
  hapticOnCommit = true,
  height = 200,
  itemHeight = 40,
  activeItemColor,
  inactiveItemColor,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(
    data.findIndex((item) => String(item.value) == String(selectedValue))
  );

  const flatListRef = useRef<Animated.FlatList<typeof data>>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastEmitTsRef = useRef(0);
  const settlingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const programmaticScrollRef = useRef(false);

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const index = returnIndex(contentOffset.y);
    if (index === selectedIndex) return;

    setSelectedIndex(index);

    const now = Date.now();
    if (now - lastEmitTsRef.current >= throttleMs) {
      lastEmitTsRef.current = now;
      onValueChange?.(data[index].value);
    }

    if (settlingTimerRef.current) clearTimeout(settlingTimerRef.current);
    settlingTimerRef.current = setTimeout(() => {
      programmaticScrollRef.current = true;
      flatListRef.current?.scrollToOffset({
        offset: index * itemHeight,
        animated: true,
      });
      onValueCommit?.(data[index].value);
    }, 120);
    if (hapticOnCommit) softHaptic();
  };

  const handleScrollEnd = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const index = returnIndex(contentOffset.y);

    if (programmaticScrollRef.current) {
      programmaticScrollRef.current = false;
    } else {
      programmaticScrollRef.current = true;
      flatListRef.current?.scrollToOffset({
        offset: index * itemHeight,
        animated: true,
      });
    }

    if (index !== selectedIndex) {
      setSelectedIndex(index);
    }
    onValueCommit?.(data[index].value);
    if (hapticOnCommit) softHaptic();
  };

  const returnIndex = (contentYOffset: any) => {
    let index = Math.round(contentYOffset / itemHeight);

    index = index >= data.length - 1 ? data.length - 1 : index < 0 ? 0 : index;

    return index;
  };

  useEffect(() => {
    const idx = data.findIndex((item) => String(item.value) === String(selectedValue));

    if (data.length < 6) {
      const idx = data.findIndex((item) => {
        console.log("selected value", Number(selectedValue));
        console.log("item", Number(item.value));

        return String(item.value) === String(selectedValue);
      });
      console.log("idx", idx);
    }
    if (idx < 0) return;

    programmaticScrollRef.current = true;
    flatListRef.current?.scrollToIndex({ index: idx, animated: false });
    setSelectedIndex(idx);
    lastEmitTsRef.current = 0;

    return () => {
      if (settlingTimerRef.current) clearTimeout(settlingTimerRef.current);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.row}>
        <Animated.FlatList
          ref={flatListRef}
          windowSize={16}
          maxToRenderPerBatch={32}
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
          initialNumToRender={32}
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
