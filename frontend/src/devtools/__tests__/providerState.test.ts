import { describe, expect, it } from "vitest";

import {
  closeDeveloperToolsPanel,
  createDeveloperToolsState,
  openDeveloperToolsPanel,
  setDeveloperToolsBadgeVisible,
} from "../state";

describe("developer tools provider state", () => {
  it("never opens or renders a badge preference when tools are unavailable", () => {
    const state = createDeveloperToolsState({
      available: false,
      persistedBadgeVisible: true,
    });

    expect(openDeveloperToolsPanel(state)).toEqual({
      available: false,
      panelOpen: false,
      badgeVisible: false,
    });
  });

  it("keeps panel availability independent after the badge is hidden", () => {
    const hidden = setDeveloperToolsBadgeVisible(
      createDeveloperToolsState({ available: true, persistedBadgeVisible: true }),
      false
    );

    expect(hidden).toMatchObject({ available: true, badgeVisible: false });
    expect(openDeveloperToolsPanel(hidden).panelOpen).toBe(true);
  });

  it("closes the shared panel without changing badge visibility", () => {
    const open = openDeveloperToolsPanel(
      createDeveloperToolsState({ available: true, persistedBadgeVisible: false })
    );

    expect(closeDeveloperToolsPanel(open)).toEqual({
      available: true,
      panelOpen: false,
      badgeVisible: false,
    });
  });
});
