import { describe, expect, it } from "vitest";
import {
  buildRecordedSetUpdate,
  formatPreviousSetLine,
  getDataAvgPerDate,
  getGrowthTrend,
  groupRecordedSetsByDate,
  hasRecordedSetRir,
} from "../recordedSets";
import type { IRecordedSetRes } from "@/interfaces/Workout";

describe("recordedSets helpers", () => {
  const setWithRir: IRecordedSetRes = {
    _id: "rir-set",
    plan: "A",
    weight: 80,
    repsDone: 10,
    setNumber: 2,
    rir: 0,
    date: "2026-08-05T12:00:00.000Z",
  };

  it("formats a compact previous-set line without RIR", () => {
    expect(formatPreviousSetLine(setWithRir)).toBe("סט 2 | משקל 80 | חזרות 10");
  });

  it("recognizes zero RIR as an existing value", () => {
    expect(hasRecordedSetRir(setWithRir)).toBe(true);
  });

  it("keeps edited RIR when the original set has RIR", () => {
    expect(buildRecordedSetUpdate(setWithRir, { weight: 82.5, repsDone: 8, rir: 1 })).toEqual({
      setNumber: 2,
      weight: 82.5,
      repsDone: 8,
      rir: 1,
    });
  });

  it("does not add RIR when the original set has no RIR", () => {
    const setWithoutRir = { ...setWithRir, _id: "legacy-set", rir: undefined };

    expect(buildRecordedSetUpdate(setWithoutRir, { weight: 82.5, repsDone: 8, rir: 1 })).toEqual({
      setNumber: 2,
      weight: 82.5,
      repsDone: 8,
    });
  });

  it("groups recorded sets by formatted date", () => {
    const recordedSets: IRecordedSetRes[] = [
      {
        _id: "1",
        plan: "A",
        weight: 100,
        repsDone: 8,
        setNumber: 1,
        date: "2026-03-19T12:00:00.000Z",
      },
      {
        _id: "2",
        plan: "A",
        weight: 110,
        repsDone: 6,
        setNumber: 2,
        date: "2026-03-19T15:00:00.000Z",
      },
      {
        _id: "3",
        plan: "A",
        weight: 120,
        repsDone: 5,
        setNumber: 3,
        date: "2026-03-20T12:00:00.000Z",
      },
    ];

    expect(groupRecordedSetsByDate(recordedSets)).toEqual({
      "19.03": { totalReps: 14, totalWeight: 210, count: 2 },
      "20.03": { totalReps: 5, totalWeight: 120, count: 1 },
    });
  });

  it("calculates average reps and weight per date", () => {
    expect(
      getDataAvgPerDate({
        "19.03": { totalReps: 15, totalWeight: 205, count: 2 },
      })
    ).toEqual({
      repAverages: [{ value: 8, label: "19.03" }],
      weightAverages: [{ value: 102.5, label: "19.03" }],
    });
  });

  it("calculates percentage growth", () => {
    expect(getGrowthTrend(120, 100)).toBe(20);
  });
});
