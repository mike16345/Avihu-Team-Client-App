import { describe, expect, it } from "vitest";

import { getSafeAreaPadding } from "../safeAreaSpacing";

describe("getSafeAreaPadding", () => {
  it("preserves device insets when they exceed the minimum bottom padding", () => {
    expect(getSafeAreaPadding({ top: 47, bottom: 34 }, 24)).toEqual({
      paddingTop: 47,
      paddingBottom: 34,
    });
  });

  it("uses the minimum bottom padding when the device has no bottom inset", () => {
    expect(getSafeAreaPadding({ top: 24, bottom: 0 }, 24)).toEqual({
      paddingTop: 24,
      paddingBottom: 24,
    });
  });
});
