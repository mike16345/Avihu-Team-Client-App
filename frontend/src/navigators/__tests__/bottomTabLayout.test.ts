import { describe, expect, it } from "vitest";

import { getBottomTabLayout } from "../bottomTabLayout";

describe("getBottomTabLayout", () => {
  it.each([
    [0, 20, 35, 20, 100],
    [20, 20, 35, 20, 100],
    [34, 34, 49, 34, 114],
    [80, 80, 95, 80, 160],
  ])(
    "keeps the complete floating bar above a %ipx bottom inset",
    (bottomInset, tabBarBottom, activeIndicatorBottom, shadowBottom, scenePaddingBottom) => {
      expect(getBottomTabLayout({ bottomInset, keyboardVisible: false })).toEqual({
        tabBarBottom,
        activeIndicatorBottom,
        shadowBottom,
        scenePaddingBottom,
        tabBarVisible: true,
      });
    }
  );

  it("removes the bar reservation while preserving the safe bottom when the keyboard is visible", () => {
    expect(getBottomTabLayout({ bottomInset: 34, keyboardVisible: true })).toEqual({
      tabBarBottom: 34,
      activeIndicatorBottom: 49,
      shadowBottom: 34,
      scenePaddingBottom: 34,
      tabBarVisible: false,
    });
  });
});
