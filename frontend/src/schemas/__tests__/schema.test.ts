import { describe, expect, it } from "vitest";
import measurementSchema from "../measurementSchema";
import setSchema from "../setSchema";

describe("setSchema", () => {
  it("accepts a valid set input", () => {
    const result = setSchema.safeParse({
      setNumber: 1,
      weight: 80,
      repsDone: 10,
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid reps", () => {
    const result = setSchema.safeParse({
      setNumber: 1,
      weight: 80,
      repsDone: 0,
    });

    expect(result.success).toBe(false);
  });

  it("accepts bodyweight sets (weight = 0)", () => {
    const result = setSchema.safeParse({
      setNumber: 1,
      weight: 0,
      repsDone: 12,
    });

    expect(result.success).toBe(true);
  });

  it("accepts null rir (removal signal)", () => {
    const result = setSchema.safeParse({
      setNumber: 1,
      weight: 60,
      repsDone: 10,
      rir: null,
    });

    expect(result.success).toBe(true);
  });
});

describe("measurementSchema", () => {
  it("accepts a valid positive measurement", () => {
    expect(measurementSchema.safeParse({ measurement: 42 }).success).toBe(true);
  });

  it("rejects non-positive measurements", () => {
    expect(measurementSchema.safeParse({ measurement: 0 }).success).toBe(false);
  });

  it("rejects measurements above the maximum", () => {
    expect(measurementSchema.safeParse({ measurement: 161 }).success).toBe(false);
  });
});
