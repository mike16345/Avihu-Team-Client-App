import { semanticColors } from "@/themes/semanticColors";
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

export const GREEN_DARK = semanticColors.steps.aboveGoalDark;
export const GREEN_MID = semanticColors.steps.aboveGoal;
export const GREEN_LIGHT = semanticColors.steps.aboveGoalLight;
export const RED_DARK = semanticColors.steps.belowGoalDark;
export const RED_MID = semanticColors.steps.belowGoal;
export const RED_LIGHT = semanticColors.steps.belowGoalLight;
export const RING_TRACK = semanticColors.steps.ringTrack;
export const RING_GRAD_START = semanticColors.steps.ringGradientStart;
export const RING_GRAD_END = semanticColors.steps.ringGradientEnd;
export const SURFACE_WHITE = semanticColors.app.surfaceRaised;
export const PRIMARY_DARK = semanticColors.steps.ringGradientStart;
export const LIGHT_TEXT_ON_DARK = semanticColors.errorContainer;
export const MUTED_TEXT = semanticColors.steps.mutedText;
export const MUTED_TEXT_SOFT = semanticColors.steps.mutedTextSoft;
export const MUTED_TEXT_FAINT = semanticColors.steps.mutedTextFaint;
export const HAIRLINE = semanticColors.steps.selectedPill;
export const BASELINE_LINE = semanticColors.steps.baseline;
export const TARGET_LINE = semanticColors.steps.target;
export const DAY_LABEL_TEXT = semanticColors.steps.dayLabel;
export const SELECTED_PILL_BG = semanticColors.steps.selectedPill;

export const SMALL_SCREEN_BREAKPOINT = 360;

export const responsiveSizes = (isSmall: boolean) => ({
  ringSize: isSmall ? 100 : 120,
  titleFont: isSmall ? 17 : 20,
  ringValueFont: isSmall ? 22 : 26,
  detailValueFont: isSmall ? 18 : 22,
  ringTextGap: isSmall ? 28 : 56,
});
