import {
  ScrollViewProps,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import ScrollViewShadow from "./ScrollViewShadow";

const CustomScrollView: React.FC<ScrollViewProps> = ({ children, ...props }) => {
  const shadowOpacity = useSharedValue(1);
  const scrollViewRef = useRef<ScrollView>(null);

  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentSize, contentOffset } = event.nativeEvent;

    setIsAtBottom(layoutMeasurement.height + contentOffset.y >= contentSize.height - 10);
    setIsAtTop(contentOffset.y <= 10);

    props.onScroll?.(event);
  };

  const animatedShadowStyle = useAnimatedStyle(() => ({
    opacity: shadowOpacity.value,
  }));

  return (
    <View style={{ flex: 1 }}>
      <ScrollViewShadow inverted isAtEnd={isAtTop} style={animatedShadowStyle} />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        {...props}
        onScroll={handleScroll}
        scrollEventThrottle={16} // Smooth scroll tracking
      >
        {children}
      </ScrollView>

      <ScrollViewShadow isAtEnd={isAtBottom} style={animatedShadowStyle} />
    </View>
  );
};

export default CustomScrollView;
