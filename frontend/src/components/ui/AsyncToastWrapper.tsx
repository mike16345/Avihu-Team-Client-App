import { IToast } from "@/interfaces/toast";
import React, { ReactNode, useEffect, useState } from "react";
import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";
import { ConditionalRender } from "./ConditionalRender";
import Toast from "./toast/Toast";
import { useToast } from "@/hooks/useToast";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

interface AsyncToastWrapperProps {
  children: ReactNode;
  onPress: () => Promise<void>;
  toastDuration?: number;
  messages?: {
    success?: { title?: string; message?: string };
    error?: { title?: string; message?: string };
  };
  style?: StyleProp<ViewStyle>;
}

const AsyncToastWrapper: React.FC<AsyncToastWrapperProps> = ({
  children,
  onPress,
  toastDuration = 5000,
  messages,
  style,
}) => {
  const { triggerErrorToast } = useToast();

  const [toast, setToast] = useState<Partial<IToast> | undefined>();
  const [contentHeight, setContentHeight] = useState(0);

  const buttonTranslateY = useSharedValue(0);
  const toastTranslateY = useSharedValue(0);

  const animateInToast = () => {
    buttonTranslateY.value = withTiming(-contentHeight - 100, { duration: 300 });
    toastTranslateY.value = withTiming(-contentHeight / 1.5, { duration: 300 });
  };

  const animateOutToast = () => {
    buttonTranslateY.value = withTiming(0, { duration: 300 });
    toastTranslateY.value = withTiming(contentHeight, { duration: 300 }, (finished) => {
      if (finished) runOnJS(setToast)(undefined);
    });
  };

  const showLocalToast = ({
    message,
    duration,
    title,
  }: {
    message?: string;
    duration?: number;
    title?: string;
  }) => {
    setToast({ message, duration, title, type: "success" });
    animateInToast();
    setTimeout(() => {
      animateOutToast();
    }, duration);
  };

  const handlePress = async () => {
    try {
      await onPress();

      showLocalToast({
        message: messages?.success?.message || "פעולה בוצעה בהצלחה",
        title: messages?.success?.title || "הצלחה",
        duration: toastDuration,
      });
    } catch (error: any) {
      console.error(error);
      triggerErrorToast({
        message: messages?.error?.message || error.message,
        title: messages?.error?.title,
        duration: toastDuration,
      });
    }
  };

  useEffect(() => {
    toastTranslateY.value = contentHeight;
  }, [contentHeight]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  return (
    <View style={[style, { overflow: "hidden" }]}>
      <Animated.View
        style={buttonAnimatedStyle}
        onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
      >
        <TouchableOpacity onPress={handlePress}>{children}</TouchableOpacity>
      </Animated.View>

      <ConditionalRender condition={toast}>
        <Toast externalTranslateY={toastTranslateY} toast={toast} />
      </ConditionalRender>
    </View>
  );
};

export default AsyncToastWrapper;
