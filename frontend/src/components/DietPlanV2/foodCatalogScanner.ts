const MINIMUM_SCAN_FEEDBACK_MS = 650;

export const BARCODE_HOLD_DURATION_MS = 1_500;
export const BARCODE_HOLD_MAX_GAP_MS = 750;

export interface BarcodeHoldCandidate {
  barcode: string;
  startedAt: number;
  lastSeenAt: number;
}

export const updateBarcodeHoldCandidate = (
  current: BarcodeHoldCandidate | null,
  barcode: string,
  now: number
): BarcodeHoldCandidate => {
  const isContinuous =
    current?.barcode === barcode && now - current.lastSeenAt <= BARCODE_HOLD_MAX_GAP_MS;

  if (current && isContinuous) {
    return { ...current, lastSeenAt: now };
  }

  return { barcode, startedAt: now, lastSeenAt: now };
};

export const isBarcodeHoldReady = (candidate: BarcodeHoldCandidate, now: number): boolean =>
  now - candidate.startedAt >= BARCODE_HOLD_DURATION_MS &&
  now - candidate.lastSeenAt <= BARCODE_HOLD_MAX_GAP_MS;

export const getRemainingScanFeedbackMs = (startedAt: number, now: number): number =>
  Math.max(0, MINIMUM_SCAN_FEEDBACK_MS - (now - startedAt));
