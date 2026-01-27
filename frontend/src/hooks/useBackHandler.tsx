import { useEffect, useRef } from "react";
import { BackHandler, Platform } from "react-native";

export default function useBackHandler(onBackPress: () => boolean) {
  const callbackRef = useRef(onBackPress);

  // keep ref updated without re-subscribing
  useEffect(() => {
    callbackRef.current = onBackPress;
  }, [onBackPress]);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => callbackRef.current());

    return () => sub.remove();
  }, []);
}
