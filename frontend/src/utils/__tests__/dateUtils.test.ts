import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DateUtils from "../dateUtils";

type Metric = {
  date: string;
  value: number;
};

describe("DateUtils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-19T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates an average over the requested day range", () => {
    const items: Metric[] = [
      { date: "2026-03-13T13:00:00.000Z", value: 80 },
      { date: "2026-03-18T13:00:00.000Z", value: 82 },
      { date: "2026-03-10T13:00:00.000Z", value: 100 },
    ];

    expect(DateUtils.getAverageInLastXDays(items, "date", "value", 7)).toBe(81);
  });

  it("calculates progress between the first and last recent item", () => {
    const items: Metric[] = [
      { date: "2026-03-13T13:00:00.000Z", value: 81 },
      { date: "2026-03-18T13:00:00.000Z", value: 78 },
    ];

    expect(DateUtils.getProgressInLastXDays(items, "date", "value", 7)).toBe(-3);
  });

  it("sorts values by ascending date", () => {
    const values = [
      { date: new Date("2026-03-20T00:00:00.000Z"), value: 2 },
      { date: new Date("2026-03-18T00:00:00.000Z"), value: 1 },
    ];

    expect(DateUtils.sortByDate(values, "asc").map((item) => item.value)).toEqual([1, 2]);
  });

  it("filters items inside a weekly range", () => {
    const items: Metric[] = [
      { date: "2026-03-18T12:00:00.000Z", value: 1 },
      { date: "2026-03-13T12:00:00.000Z", value: 2 },
      { date: "2026-01-01T12:00:00.000Z", value: 3 },
    ];

    expect(
      DateUtils.getItemsInRange({
        items,
        dateKey: "date",
        n: 1,
        range: "weeks",
      })
    ).toHaveLength(2);
  });

  it("throws when an item has an invalid date", () => {
    expect(() =>
      DateUtils.getItemsInRange({
        items: [{ date: "not-a-date", value: 1 }],
        dateKey: "date",
        n: 1,
        range: "weeks",
      })
    ).toThrow("'date' is not a valid date");
  });

  it("returns the latest item by date", () => {
    const latest = DateUtils.getLatestItem(
      [
        { date: "2026-03-01T12:00:00.000Z", value: 70 },
        { date: "2026-03-15T12:00:00.000Z", value: 75 },
      ],
      "date"
    );

    expect(latest).toEqual({ date: "2026-03-15T12:00:00.000Z", value: 75 });
  });

  it("detects when two dates fall on the same day", () => {
    expect(
      DateUtils.isSameDay(new Date("2026-03-19T08:00:00.000Z"), new Date("2026-03-19T22:00:00.000Z"))
    ).toBe(true);
  });
});
