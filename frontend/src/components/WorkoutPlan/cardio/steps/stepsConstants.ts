export interface DayData {
  label: string;
  steps: number | null;
  calories: number;
}

export type HealthStatus = "needsPermission" | "denied" | "granted" | "unavailable";

export const DAY_LABELS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

export const DAY_FULL_NAMES: Record<string, string> = {
  א: "ראשון",
  ב: "שני",
  ג: "שלישי",
  ד: "רביעי",
  ה: "חמישי",
  ו: "שישי",
  ש: "שבת",
};

export const MOCK_WEEK: DayData[] = [
  { label: DAY_LABELS[0], steps: 10500, calories: 320 },
  { label: DAY_LABELS[1], steps: 2000, calories: 65 },
  { label: DAY_LABELS[2], steps: 9400, calories: 285 },
  { label: DAY_LABELS[3], steps: 13200, calories: 405 },
  { label: DAY_LABELS[4], steps: 9000, calories: 275 },
  { label: DAY_LABELS[5], steps: 8000, calories: 245 },
  { label: DAY_LABELS[6], steps: 8500, calories: 258 },
];

export const DEFAULT_DAILY_GOAL = 12000;
export const TODAY_STEPS = 8500;
export const TODAY_INDEX = 6;

export const GREEN_DARK = "#2EB94D";
export const GREEN_MID = "#4ED167";
export const GREEN_LIGHT = "#C7F0CB";
export const RED_DARK = "#DC6E4A";
export const RED_MID = "#E88E72";
export const RED_LIGHT = "#F4C4B5";
export const RING_TRACK = "#E4E7EC";
export const RING_GRAD_START = "#072723";
export const RING_GRAD_END = "#9FE6A3";
export const SURFACE_WHITE = "#FFFFFF";
export const PRIMARY_DARK = "#072723";
export const LIGHT_TEXT_ON_DARK = "#F8F8F8";
export const MUTED_TEXT = "rgba(7,39,35,0.55)";
export const MUTED_TEXT_SOFT = "rgba(7,39,35,0.6)";
export const MUTED_TEXT_FAINT = "rgba(7,39,35,0.45)";
export const HAIRLINE = "rgba(7,39,35,0.08)";
export const BASELINE_LINE = "rgba(7,39,35,0.12)";
export const TARGET_LINE = "rgba(7,39,35,0.3)";
export const DAY_LABEL_TEXT = "rgba(7,39,35,0.75)";
export const SELECTED_PILL_BG = "rgba(7,39,35,0.08)";

export const SMALL_SCREEN_BREAKPOINT = 360;

export const formatSteps = (n: number): string => {
  return Math.round(n).toLocaleString("he-IL");
};

export const responsiveSizes = (isSmall: boolean) => ({
  ringSize: isSmall ? 100 : 120,
  titleFont: isSmall ? 17 : 20,
  ringValueFont: isSmall ? 22 : 26,
  detailValueFont: isSmall ? 18 : 22,
  ringTextGap: isSmall ? 28 : 56,
});
