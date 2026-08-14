const MINIMUM_SCAN_FEEDBACK_MS = 650;

export const getRemainingScanFeedbackMs = (startedAt: number, now: number): number =>
  Math.max(0, MINIMUM_SCAN_FEEDBACK_MS - (now - startedAt));
