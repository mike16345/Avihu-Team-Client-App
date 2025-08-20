import Icon from "@/components/Icon/Icon";
import useStyles from "@/styles/useGlobalStyles";
import React, { ReactNode, useCallback, useRef, useState } from "react";
import {
  FlatList,
  I18nManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
  View,
  ListRenderItem,
} from "react-native";

interface WindowProps {
  windowItems: ReactNode[];
}

const Windows: React.FC<WindowProps> = ({ windowItems }) => {
  const { width } = useWindowDimensions();
  const { layout, spacing } = useStyles();
  const separator = spacing.gapMd.gap ?? 0;

  const listRef = useRef<FlatList<ReactNode>>(null);
  const dragStartXRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

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
    setActiveIndex(idx); // update immediately so next swipe is relative
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
      ? Math.min(Math.max(activeIndex + visualDir, 0), windowItems.length - 1)
      : activeIndex;

    snapToIndex(next);
  };

  const renderItem = useCallback<ListRenderItem<ReactNode>>(
    ({ item }) => <View style={{ width }}>{item}</View>,
    [width]
  );

  return (
    <>
      <FlatList
        ref={listRef}
        horizontal
        data={windowItems}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
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
          <Icon key={i} name={i === activeIndex ? "elipse" : "elipseSoft"} height={10} width={10} />
        ))}
      </View>
    </>
  );
};

export default Windows;
