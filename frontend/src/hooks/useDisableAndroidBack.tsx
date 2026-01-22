// hooks/useDisableAndroidBack.ts
import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";

export function useDisableAndroidBack(disabled = true) {
  useEffect(() => {
    if (!disabled || Platform.OS !== "android") return;

    const handler = BackHandler.addEventListener("hardwareBackPress", () => true);

    return () => handler.remove();
  }, [disabled]);
}
