import { useEffect, useState } from "react";
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RTL_FIX_KEY = "rtl_restarted_once";
const isDevMode = process.env.EXPO_PUBLIC_MODE;

export const useOneTimeRTLFix = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const applyRTLFix = async () => {
      try {
        const alreadyApplied = await AsyncStorage.getItem(RTL_FIX_KEY);

        console.log(`already applied`, alreadyApplied);

        if (!alreadyApplied && !I18nManager.isRTL) {
          console.log(`calling this block`);

          I18nManager.allowRTL(true);
          I18nManager.forceRTL(true);

          await AsyncStorage.setItem(RTL_FIX_KEY, "true");

          await Updates.reloadAsync(); // Trigger one-time reload
          return;
        }

        setReady(true); // Only set ready if no reload needed
      } catch (err) {
        console.warn("RTL fix failed:", err);
      } finally {
        setReady(true); // Avoid blocking UI forever
      }
    };

    applyRTLFix();

    return () => {
      if (isDevMode) {
        AsyncStorage.removeItem(RTL_FIX_KEY);
      }
    };
  }, []);

  return ready;
};
