import { IToast } from "@/interfaces/toast";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";
import { ConditionalRender } from "./ConditionalRender";
import Toast from "./toast/Toast";
import { useToast } from "@/hooks/useToast";

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
      }); //Making the user waut 5 X toast duration until they can try again after an error seems bad in terms of UX. I swapped this to the global toast instead.
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

export default AsyncToastWrapper;
