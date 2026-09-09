import { describe, expect, it } from "vitest";

import { getModalSafeAreaPadding } from "../modalSafeArea";

describe("getModalSafeAreaPadding", () => {
  it.each([
    [
      { top: 47, bottom: 0 },
      { paddingTop: 48, paddingBottom: 60 },
    ],
    [
      { top: 80, bottom: 34 },
      { paddingTop: 80, paddingBottom: 60 },
    ],
    [
      { top: 47, bottom: 80 },
      { paddingTop: 48, paddingBottom: 80 },
    ],
  ])("applies each inset once above the existing content minimum", (insets, expected) => {
    expect(getModalSafeAreaPadding(insets)).toEqual(expected);
  });
});
