import { useEffect, useState } from "react";
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RTL_FIX_KEY = "rtl_restarted_once";

export const useOneTimeRTLFix = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const applyRTLFix = async () => {
      try {
        const alreadyApplied = await AsyncStorage.getItem(RTL_FIX_KEY);

        if (!alreadyApplied && I18nManager.isRTL) {
          I18nManager.allowRTL(false);
          I18nManager.forceRTL(false);
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
  }, []);

  return ready;
};
