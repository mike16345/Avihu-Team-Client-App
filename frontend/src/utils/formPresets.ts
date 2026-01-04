import moment from "moment";
import { FormPreset } from "@/interfaces/FormPreset";

export const getMonthOccurrenceKey = (date: Date = new Date()) => moment(date).format("YYYY-MM");

export const getDateOccurrenceKey = (date: Date | string) => moment(date).format("YYYY-MM-DD");

export const getOccurrenceKeyForForm = (form: FormPreset, now: Date = new Date()) => {
  if (form.type === "monthly") {
    return getMonthOccurrenceKey(now);
  }

  if (form.type === "general" && form.showOn) {
    return getDateOccurrenceKey(form.showOn);
  }

  if (form.type === "onboarding") {
    return "onboarding";
  }

  return null;
};

export const isOptionQuestionType = (type: string) =>
  ["radio", "drop-down", "checkboxes", "range"].includes(type);
