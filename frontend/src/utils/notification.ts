import { TriggerAt } from "@/hooks/useNotfication";
import * as Notifications from "expo-notifications";

export function toTrigger(
  triggerAt: TriggerAt,
  opts: { repeats?: boolean; channelId?: string } = {}
): Notifications.NotificationTriggerInput {
  if (triggerAt == null) {
    // Immediate delivery must be `null` (not {}).
    return null;
  }

  if (triggerAt instanceof Date) {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerAt,
      channelId: opts.channelId,
    } satisfies Notifications.DateTriggerInput;
  }

  // seconds-from-now; clamp to >= 1s
  const seconds = Math.max(1, Math.floor(triggerAt));
  return {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds,
    repeats: !!opts.repeats,
    channelId: opts.channelId,
  } satisfies Notifications.TimeIntervalTriggerInput;
}

/** Compute the next local 08:00 from "now" */
export function getNextEightAM(from = new Date()) {
  const next = new Date(from);
  next.setHours(8, 0, 0, 0);
  if (next <= from) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export function getNextEightAMOnSunday(from = new Date()) {
  const next = new Date(from);

  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysUntilSunday = (7 - next.getDay()) % 7 || 7;
  next.setDate(next.getDate() + daysUntilSunday);

  next.setHours(8, 0, 0, 0);
  return next;
}
