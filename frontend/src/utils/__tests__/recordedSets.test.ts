import { describe, expect, it } from "vitest";
import { getDataAvgPerDate, getGrowthTrend, groupRecordedSetsByDate } from "../recordedSets";
import type { IRecordedSetRes } from "@/interfaces/Workout";

describe("recordedSets helpers", () => {
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
