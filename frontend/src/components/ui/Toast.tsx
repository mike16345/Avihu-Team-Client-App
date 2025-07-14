import { useThemeContext } from "@/themes/useAppTheme";
import React, { useEffect, useState } from "react";
import { StyleSheet, Animated, View } from "react-native";
import NativeIcon from "../Icon/NativeIcon";
import { IconLibrary, IconNames } from "@/types/iconTypes";
import { Text } from "./Text";

interface ToastProps {
  message: string;
  visible: boolean;
  type: "success" | "info" | "warning" | "error";
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, visible, type, onHide }) => {
  const { theme } = useThemeContext();
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timeout = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide();
        });
      }, 3000);

      return () => clearTimeout(timeout);
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, opacity, onHide]);

  if (!visible) return null;

  const toastConfig = {
    success: {
      background: theme.colors.successContainer,
      text: theme.colors.onSuccessContainer,
      icon: { library: "AntDesign", name: "checkcircleo", color: theme.colors.onSuccessContainer },
    },
    info: {
      background: theme.colors.infoContainer,
      text: theme.colors.onInfoContainer,
      icon: { library: "Entypo", name: "info", color: theme.colors.onInfoContainer },
    },
    warning: {
      background: theme.colors.warningContainer,
      text: theme.colors.onWarningContainer,
      icon: { library: "MaterialIcons", name: "warning", color: theme.colors.onWarningContainer },
    },
    error: {
      background: theme.colors.errorContainer,
      text: theme.colors.onErrorContainer,
      icon: {
        library: "MaterialCommunityIcons",
        name: "alert-circle",
        color: theme.colors.onErrorContainer,
      },
    },
  };

  return (
    <View pointerEvents="none">
      <Animated.View
        style={[styles.toastContainer, { opacity, backgroundColor: toastConfig[type].background }]}
      >
        <NativeIcon
          library={toastConfig[type].icon.library as IconLibrary}
          name={toastConfig[type].icon.name as IconNames<IconLibrary>}
          color={toastConfig[type].icon.color}
          size={24}
        />
        <Text style={[styles.toastMessage, { color: toastConfig[type].text }]}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
  },
  toastMessage: {
    fontSize: 16,
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
});

export default Toast;
