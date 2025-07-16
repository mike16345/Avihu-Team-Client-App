import { IToast } from "@/interfaces/toast";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";
import { ConditionalRender } from "./ConditionalRender";
import Toast from "./toast/Toast";

interface AsyncWrapperProps {
  children: ReactNode;
  onPress: () => Promise<void>;
  toastDuration?: number;
  messages: {
    success: { title?: string; message: string };
    error?: { title?: string; message?: string };
  };
  style?: StyleProp<ViewStyle>;
}

const AsyncWrapper: React.FC<AsyncWrapperProps> = ({
  children,
  onPress,
  toastDuration = 5000,
  messages,
  style,
}) => {
  const [toast, setToast] = useState<Partial<IToast> | undefined>();
  const [contentHeight, setContentHeight] = useState(0);

  const buttonTranslateY = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(0)).current;

  const animateInToast = () => {
    Animated.parallel([
      Animated.timing(buttonTranslateY, {
        toValue: -contentHeight - 100, //added safety buffer for shadows to disapear as well
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOutToast = () => {
    Animated.parallel([
      Animated.timing(buttonTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: contentHeight,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(undefined));
  };

  const showLocalToast = ({
    message,
    duration,
    title,
    type,
  }: {
    message: string;
    duration?: number;
    title?: string;
    type: "success" | "error";
  }) => {
    setToast({ message, duration, title, type });

    animateInToast();

    setTimeout(() => {
      animateOutToast();
    }, duration);
  };

  const handlePress = async () => {
    try {
      await onPress();

      showLocalToast({
        message: messages.success.message,
        title: messages.success.title || "הצלחה",
        type: "success",
        duration: toastDuration,
      });
    } catch (error: any) {
      console.error(error);
      showLocalToast({
        message: messages?.error?.message || error.message,
        title: messages?.error?.title || "שגיאה",
        type: "error",
        duration: toastDuration,
      });
    }
  };

  useEffect(() => {
    toastTranslateY.setValue(contentHeight);
  }, [contentHeight]);

  return (
    <View style={[style, { overflow: "hidden" }]}>
      <Animated.View
        style={{
          transform: [{ translateY: buttonTranslateY }],
        }}
        onLayout={(e) => {
          setContentHeight(e.nativeEvent.layout.height);
        }}
      >
        <TouchableOpacity onPress={handlePress}>{children}</TouchableOpacity>
      </Animated.View>

      <ConditionalRender condition={toast}>
        <Toast externalTranslateY={toastTranslateY} toast={toast} />
      </ConditionalRender>
    </View>
  );
};

export default AsyncWrapper;
