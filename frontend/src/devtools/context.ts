import { createContext, useContext } from "react";

export interface DeveloperToolsContextValue {
  available: boolean;
  panelOpen: boolean;
  badgeVisible: boolean;
  openPanel(): void;
  closePanel(): void;
  setBadgeVisible(visible: boolean): void;
}

const unavailableContext: DeveloperToolsContextValue = {
  available: false,
  panelOpen: false,
  badgeVisible: false,
  openPanel: () => undefined,
  closePanel: () => undefined,
  setBadgeVisible: () => undefined,
};

export const DeveloperToolsContext = createContext<DeveloperToolsContextValue>(unavailableContext);

export const useDeveloperTools = (): DeveloperToolsContextValue =>
  useContext(DeveloperToolsContext);
