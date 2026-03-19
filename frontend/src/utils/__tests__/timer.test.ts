import { describe, expect, it } from "vitest";
import { formatTime } from "../timer";

describe("formatTime", () => {
  it("formats zero seconds", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("pads single-digit seconds", () => {
    expect(formatTime(65)).toBe("1:05");
  });

  it("formats whole minutes", () => {
    expect(formatTime(600)).toBe("10:00");
  });
});
