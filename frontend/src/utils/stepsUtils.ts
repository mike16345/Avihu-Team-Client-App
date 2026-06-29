import { IStepsCardioType } from "@/interfaces/Workout";

export const DEFAULT_DAILY_GOAL = 10000;
export const STEP_DISTANCE_METERS = 0.762;

export const formatSteps = (value: number): string => Math.round(value).toLocaleString("he-IL");

export const getLocalDateKey = (date: Date = new Date()): string => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
};

export const stepsToCalories = (steps: number): number => Math.round(steps * 0.04);

const getDistanceKm = (steps: number): number => (steps * STEP_DISTANCE_METERS) / 1000;

export const stepsToDistanceKm = (steps: number, fractionDigits = 2): number =>
  Number(getDistanceKm(steps).toFixed(fractionDigits));

export const formatDistanceKm = (steps: number, fractionDigits = 1): string =>
  getDistanceKm(steps).toFixed(fractionDigits);

export const buildGoalsByDay = (plan?: IStepsCardioType): number[] => {
  if (!plan) {
    return Array.from({ length: 7 }, () => DEFAULT_DAILY_GOAL);
  }

  if (plan.mode === "custom" && plan.perDay?.length === 7) {
    return plan.perDay;
  }

  return Array.from({ length: 7 }, () => plan.daily);
};

const formatDateLabel = (value: string): string => {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}.${month}.${year}`;
};

export const formatWeekRange = (startDate?: string, endDate?: string): string | undefined => {
  if (!startDate || !endDate) {
    return undefined;
  }

  return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
};
