import { describe, expect, it, vi } from "vitest";
import {
  findTodaySetId,
  getLatestDeletableRowIndex,
  getSetRowKey,
  type RowState,
} from "../setInputTableUtils";

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

describe("findTodaySetId", () => {
  it("returns the saved id for the requested set number", () => {
    const today = new Date().toISOString();
    const data = [
      {
        recordedSets: {
          Squat: [
            {
              _id: "set-3",
              date: today,
              plan: "A",
              weight: 100,
              repsDone: 8,
              setNumber: 3,
            },
          ],
        },
      },
    ];

    expect(findTodaySetId(data, "Squat", 3)).toBe("set-3");
  });
});

describe("getSetRowKey", () => {
  it("uses the saved set id so a deleted swipeable is not reused for another row", () => {
    expect(getSetRowKey(buildRow(2, "set-2"))).toBe("saved-set-2");
    expect(getSetRowKey(buildRow(3, "set-3"))).toBe("saved-set-3");
  });

  it("keeps unsaved rows distinct from saved rows", () => {
    expect(getSetRowKey(buildRow(2))).toBe("unsaved-2");
  });
});
