import { describe, expect, it } from "vitest";
import { getTextStartAlignment } from "../textDirection";

describe("getTextStartAlignment", () => {
  it("uses the pre-swap edge when native RTL swapping is enabled", () => {
    expect(getTextStartAlignment(true, true)).toBe("left");
  });

  it("places logical text start on the right when native RTL swapping is disabled", () => {
    expect(getTextStartAlignment(true, false)).toBe("right");
  });

  it("places logical text start on the left in LTR layouts", () => {
    expect(getTextStartAlignment(false, true)).toBe("left");
  });
});
