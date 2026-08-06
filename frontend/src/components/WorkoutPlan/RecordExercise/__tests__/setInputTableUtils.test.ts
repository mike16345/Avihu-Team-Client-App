import { describe, expect, it, vi } from "vitest";
import { getLatestDeletableRowIndex, type RowState } from "../setInputTableUtils";

vi.mock("@/utils/utils", () => ({
  isIndexOutOfBounds: (array: unknown[], index: number) => index < 0 || index >= array.length,
}));

const buildRow = (setNumber: number, savedSetId?: string): RowState => ({
  setNumber,
  weight: savedSetId ? "80" : "",
  reps: savedSetId ? "10" : "",
  rir: "",
  completed: Boolean(savedSetId),
  saving: false,
  savedSetId,
});

describe("getLatestDeletableRowIndex", () => {
  it("does not allow the first recorded set to be deleted", () => {
    expect(getLatestDeletableRowIndex([buildRow(1, "set-1"), buildRow(2)])).toBe(-1);
  });

  it("allows the latest recorded set before every planned row is completed", () => {
    expect(
      getLatestDeletableRowIndex([
        buildRow(1, "set-1"),
        buildRow(2, "set-2"),
        buildRow(3),
      ]),
    ).toBe(1);
  });

  it("allows only the latest set when all planned rows are recorded", () => {
    expect(
      getLatestDeletableRowIndex([
        buildRow(1, "set-1"),
        buildRow(2, "set-2"),
        buildRow(3, "set-3"),
      ]),
    ).toBe(2);
  });
});
