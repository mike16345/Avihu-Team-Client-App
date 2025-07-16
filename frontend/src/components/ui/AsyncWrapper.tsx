import { useAsyncWrapper } from "@/hooks/useAsyncWrapper";
import { ReactNode, useEffect, useRef } from "react";
import { Animated, TouchableOpacity, ViewStyle } from "react-native";

interface AsyncWrapperProps {
  children: ReactNode;
  onPress?: () => Promise<void>;
  visible: boolean;
}

const AsyncWrapper: React.FC<AsyncWrapperProps> = ({ children, onPress, visible }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: visible ? 0 : -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
    </Animated.View>
  );
};

export default AsyncWrapper;
