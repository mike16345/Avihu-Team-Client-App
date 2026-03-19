import { describe, expect, it, vi } from "vitest";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {},
}));

import { getNextSetNumberFromSession } from "../workoutSessionStore";
import type { ISession } from "@/interfaces/ISession";

describe("getNextSetNumberFromSession", () => {
  it("returns 1 when there is no session", () => {
    expect(getNextSetNumberFromSession(null, "Push", "Bench Press")).toBe(1);
  });

  it("returns 1 when the plan or exercise is missing", () => {
    const session: ISession = {
      _id: "session-1",
      userId: "user-1",
      type: "workout",
      data: {},
      createdAt: new Date("2026-03-19T12:00:00.000Z"),
      updatedAt: new Date("2026-03-19T12:00:00.000Z"),
    };

    expect(getNextSetNumberFromSession(session, "Push", "Bench Press")).toBe(1);
  });

  it("returns the next set number from nested session data", () => {
    const session: ISession = {
      _id: "session-1",
      userId: "user-1",
      type: "workout",
      data: {
        Push: {
          "Bench Press": {
            setNumber: 4,
          },
        },
      },
      createdAt: new Date("2026-03-19T12:00:00.000Z"),
      updatedAt: new Date("2026-03-19T12:00:00.000Z"),
    };

    expect(getNextSetNumberFromSession(session, "Push", "Bench Press")).toBe(4);
  });
});
