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
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";
import { ConditionalRender } from "../ConditionalRender";

interface CustomScrollViewProps extends KeyboardAwareScrollViewProps {
  topShadow?: boolean;
  bottomShadow?: boolean;
  topShadowFirstColor?: string;
  bottomShadowFirstColor?: string;
}

const CustomScrollView: React.FC<CustomScrollViewProps> = ({
  children,
  topShadow = true,
  bottomShadow = true,
  topShadowFirstColor,
  bottomShadowFirstColor,
  ...props
}) => {
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
      <ConditionalRender condition={topShadow}>
        <ScrollViewShadow
          inverted
          isAtEnd={isAtTop}
          style={animatedShadowStyle}
          startingColor={topShadowFirstColor}
        />
      </ConditionalRender>

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        {...props}
        onScroll={handleScroll}
        scrollEventThrottle={16} // Smooth scroll tracking
      >
        {children}
      </KeyboardAwareScrollView>

      <ConditionalRender condition={bottomShadow}>
        <ScrollViewShadow
          isAtEnd={isAtBottom}
          style={animatedShadowStyle}
          startingColor={bottomShadowFirstColor}
        />
      </ConditionalRender>
    </View>
  );
};

export default CustomScrollView;
