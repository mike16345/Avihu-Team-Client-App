import { useEffect, useState } from "react";
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TenantLocalization } from "../../config/tenants/types";
import { isTenantLayoutDirectionSatisfied } from "./rtlPolicy";

const RTL_FIX_KEY = "tenant_layout_direction";

export const useOneTimeRTLFix = (tenantId: string, localization: TenantLocalization) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const applyRTLFix = async () => {
      try {
        const appliedLayout = await AsyncStorage.getItem(RTL_FIX_KEY);
        const requestedLayout = `${tenantId}:${localization.supportsRtl}:${localization.forcesRtl}`;

        const nativeDirectionMatchesTenant = isTenantLayoutDirectionSatisfied(
          localization,
          I18nManager.isRTL
        );

        if (appliedLayout !== requestedLayout || !nativeDirectionMatchesTenant) {
          I18nManager.allowRTL(localization.supportsRtl);
          I18nManager.forceRTL(localization.forcesRtl);

          await AsyncStorage.setItem(RTL_FIX_KEY, requestedLayout);

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
  }, [localization.forcesRtl, localization.supportsRtl, tenantId]);

  return ready;
};
