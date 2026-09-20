import { describe, expect, it } from "vitest";

import { getBottomDrawerMaxHeight } from "../bottomDrawerLayout";

describe("getBottomDrawerMaxHeight", () => {
  it("recalculates the available drawer height when the live bottom bar height changes", () => {
    expect(
      getBottomDrawerMaxHeight({
        screenHeight: 800,
        bottomBarHeight: 70,
        topOffset: 100,
        minHeight: 200,
      })
    ).toBe(600);
    expect(
      getBottomDrawerMaxHeight({
        screenHeight: 800,
        bottomBarHeight: 104,
        topOffset: 100,
        minHeight: 200,
      })
    ).toBe(566);
  });
});
