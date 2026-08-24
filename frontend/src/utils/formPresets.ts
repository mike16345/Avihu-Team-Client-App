import moment from "moment";
import { FormPreset } from "@/interfaces/FormPreset";

const ISO_CALENDAR_DATE = /^(\d{4}-\d{2}-\d{2})(?:T|$)/;

export const getMonthOccurrenceKey = (date: Date = new Date()) => moment(date).format("YYYY-MM");

export const getDateOccurrenceKey = (date: Date | string) => {
  if (typeof date === "string") {
    const calendarDate = ISO_CALENDAR_DATE.exec(date)?.[1];
    if (calendarDate) return calendarDate;
  }

  return moment(date).format("YYYY-MM-DD");
};

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
