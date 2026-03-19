import { describe, expect, it } from "vitest";
import {
  getDateOccurrenceKey,
  getMonthOccurrenceKey,
  getOccurrenceKeyForForm,
  isOptionQuestionType,
} from "../formPresets";
import type { FormPreset } from "@/interfaces/FormPreset";

const baseForm: FormPreset = {
  _id: "form-1",
  name: "Test Form",
  type: "general",
  repeatMonthly: false,
  sections: [],
  createdAt: "2026-03-19T00:00:00.000Z",
  updatedAt: "2026-03-19T00:00:00.000Z",
};

describe("formPresets helpers", () => {
  it("builds a month occurrence key", () => {
    expect(getMonthOccurrenceKey(new Date("2026-03-19T12:00:00.000Z"))).toBe("2026-03");
  });

  it("builds a date occurrence key", () => {
    expect(getDateOccurrenceKey("2026-03-19T12:00:00.000Z")).toBe("2026-03-19");
  });

  it("returns the correct occurrence key for monthly forms", () => {
    expect(
      getOccurrenceKeyForForm(
        {
          ...baseForm,
          type: "monthly",
        },
        new Date("2026-05-01T09:00:00.000Z")
      )
    ).toBe("2026-05");
  });

  it("returns the configured date for general forms with showOn", () => {
    expect(
      getOccurrenceKeyForForm({
        ...baseForm,
        showOn: "2026-06-03T00:00:00.000Z",
      })
    ).toBe("2026-06-03");
  });

  it("returns onboarding for onboarding forms", () => {
    expect(
      getOccurrenceKeyForForm({
        ...baseForm,
        type: "onboarding",
      })
    ).toBe("onboarding");
  });

  it("returns null for general forms without showOn", () => {
    expect(getOccurrenceKeyForForm(baseForm)).toBeNull();
  });

  it("detects option-based question types", () => {
    expect(isOptionQuestionType("radio")).toBe(true);
    expect(isOptionQuestionType("range")).toBe(true);
    expect(isOptionQuestionType("text")).toBe(false);
  });
});
