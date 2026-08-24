import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import DeveloperToolsPanel from "@/components/dev/DeveloperToolsPanel";
import { getRuntimeTenant } from "@/config/runtimeTenant";

import { createBadgePreferenceRepository } from "./badgePreference";
import { DeveloperToolsContext } from "./context";
import { isDeveloperToolsAvailable } from "./policy";
import {
  closeDeveloperToolsPanel,
  createDeveloperToolsState,
  openDeveloperToolsPanel,
  setDeveloperToolsBadgeVisible,
} from "./state";

import type { DeveloperToolsContextValue } from "./context";

export { useDeveloperTools } from "./context";

export const DeveloperToolsProvider = ({ children }: { children: ReactNode }) => {
  const tenant = getRuntimeTenant(Constants);
  const available = isDeveloperToolsAvailable(__DEV__, tenant.environment);
  const preferenceRepository = useMemo(() => createBadgePreferenceRepository(AsyncStorage), []);
  const [state, setState] = useState(() =>
    createDeveloperToolsState({ available, persistedBadgeVisible: true })
  );

  useEffect(() => {
    if (!available) return;

    let cancelled = false;
    preferenceRepository
      .load(tenant.id)
      .then((badgeVisible) => {
        if (cancelled) return;
        setState((current) => setDeveloperToolsBadgeVisible(current, badgeVisible));
      })
      .catch(() => {
        console.error("[developer-tools] badge preference load failed");
      });

    return () => {
      cancelled = true;
    };
  }, [available, preferenceRepository, tenant.id]);

  const openPanel = useCallback(() => {
    setState(openDeveloperToolsPanel);
  }, []);

  const closePanel = useCallback(() => {
    setState(closeDeveloperToolsPanel);
  }, []);

  const setBadgeVisible = useCallback(
    (visible: boolean) => {
      if (!available) return;

      setState((current) => setDeveloperToolsBadgeVisible(current, visible));
      preferenceRepository.save(tenant.id, visible).catch(() => {
        console.error("[developer-tools] badge preference save failed");
      });
    },
    [available, preferenceRepository, tenant.id]
  );

  const value = useMemo<DeveloperToolsContextValue>(
    () => ({
      available: state.available,
      panelOpen: state.panelOpen,
      badgeVisible: state.badgeVisible,
      openPanel,
      closePanel,
      setBadgeVisible,
    }),
    [closePanel, openPanel, setBadgeVisible, state]
  );

  return (
    <DeveloperToolsContext.Provider value={value}>
      {children}
      {available && <DeveloperToolsPanel />}
    </DeveloperToolsContext.Provider>
  );
};
