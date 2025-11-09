import Icon from "@/components/Icon/Icon";
import useStyles from "@/styles/useGlobalStyles";
import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import React, { ReactNode, useCallback, useEffect, useRef } from "react";
import {
  FlatList,
  I18nManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
  View,
  ListRenderItem,
  StyleSheet,
} from "react-native";

interface WindowProps {
  windowItems: ReactNode[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const Windows: React.FC<WindowProps> = ({ windowItems, currentIndex = 1, onIndexChange }) => {
  const { width } = useWindowDimensions();
  const { layout, spacing } = useStyles();
  const separator = spacing.gapMd.gap ?? 0;

  const listRef = useRef<FlatList<ReactNode>>(null);
  const dragStartXRef = useRef(0);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: width,
      offset: index * (width + separator),
      index,
    }),
    [width, separator]
  );

  const snapToIndex = (idx: number) => {
    listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0 });
    onIndexChange(idx); // update immediately so next swipe is relative
  };

  const onScrollBeginDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    dragStartXRef.current = e.nativeEvent.contentOffset.x;
  };

  const onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const endX = e.nativeEvent.contentOffset.x;
    const dx = endX - dragStartXRef.current;

    const dir = dx === 0 ? 0 : dx > 0 ? 1 : -1;
    const visualDir = I18nManager.isRTL ? -dir : dir;

    const threshold = width * 0.15;
    const movedEnough = Math.abs(dx) >= threshold;

    const next = movedEnough
      ? Math.min(Math.max(currentIndex + visualDir, 0), windowItems.length - 1)
      : currentIndex;

    snapToIndex(next);
  };

  const renderItem = useCallback<ListRenderItem<ReactNode>>(
    ({ item }) => <View style={{ width }}>{item}</View>,
    [width]
  );

  /*  const rgba = (r: number, g: number, b: number, a: number) => `rgba(${r},${g},${b},${a})`;
  const BASE = { r: 238, g: 240, b: 242 }; */

  useEffect(() => snapToIndex(currentIndex), [currentIndex]);

  return (
    <>
      <FlatList
        ref={listRef}
        horizontal
        data={windowItems}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        initialScrollIndex={currentIndex}
        ItemSeparatorComponent={() => <View style={{ width: separator }} />}
        getItemLayout={getItemLayout}
        showsHorizontalScrollIndicator={false}
        pagingEnabled={false}
        decelerationRate="fast"
        nestedScrollEnabled
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
      />

      <View style={[spacing.gapDefault, layout.flexRow, layout.center]}>
        {windowItems.map((_, i) => (
          <Icon
            key={i}
            name={i === currentIndex ? "elipse" : "elipseSoft"}
            height={10}
            width={10}
          />
        ))}
      </View>

      {/*  <Canvas style={styles.shadowCanvas} pointerEvents="none">
        <Rect x={0} y={0} width={width} height={60}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, 120)}
            // multiple rgba stops using exact background color with decreasing alpha
            colors={[
              "rgba(0,0,0,0.00)",
              "rgba(0,0,0,0.06)",
              "rgba(0,0,0,0.10)",
              rgba(BASE.r, BASE.g, BASE.b, 1.0), // full color at the top of the gradient
              // fully transparent at bottom
            ]}
            // optional: control where each stop sits (0..1)
            // these positions give a gentle, non-sharp falloff
            positions={[0, 0.35, 0.72, 1]}
          />
        </Rect>
      </Canvas> */}
    </>
  );
};

/* const styles = StyleSheet.create({
  shadowCanvas: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60, // adjust based on your Figma frame’s height
  },
}); */

export default Windows;
