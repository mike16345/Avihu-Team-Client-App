import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { formatSteps, getLocalDateKey } from "@/utils/stepsUtils";

const LEGACY_STEPS_NOTIFICATION_IDENTIFIER = "avihu-team-daily-steps";
const MILESTONE_STORAGE_KEY = "steps-milestone-notifications";
const RTL_EMBED = "\u202B";
const RTL_RESET = "\u202C";

type StepsMilestoneId = "quarter" | "half" | "twoThirds" | "complete";

interface StepsMilestone {
  id: StepsMilestoneId;
  level: number;
  emoji: string;
  shouldTrigger: (ratio: number) => boolean;
  buildBody: () => string;
}

interface StoredMilestoneState {
  dateKey: string;
  lastSentLevel: number;
}

const MILESTONES: StepsMilestone[] = [
  {
    id: "quarter",
    level: 1,
    emoji: "\uD83D\uDC63",
    shouldTrigger: (ratio) => ratio >= 0.25,
    buildBody: () => "\u05D4\u05EA\u05D7\u05DC\u05D4 \u05D8\u05D5\u05D1\u05D4, \u05DE\u05DE\u05E9\u05D9\u05DB\u05D9\u05DD \u05DC\u05D6\u05D5\u05D6.",
  },
  {
    id: "half",
    level: 2,
    emoji: "\uD83D\uDE80",
    shouldTrigger: (ratio) => ratio > 0.5,
    buildBody: () => "\u05DB\u05D1\u05E8 \u05E2\u05D1\u05E8\u05EA \u05D0\u05EA \u05D7\u05E6\u05D9 \u05D4\u05D3\u05E8\u05DA.",
  },
  {
    id: "twoThirds",
    level: 3,
    emoji: "\uD83D\uDD25",
    shouldTrigger: (ratio) => ratio >= 2 / 3,
    buildBody: () => "\u05E2\u05D5\u05D3 \u05E7\u05E6\u05EA \u05D5\u05D0\u05EA\u05D4 \u05E1\u05D5\u05D2\u05E8 \u05D0\u05EA \u05D4\u05D9\u05E2\u05D3.",
  },
  {
    id: "complete",
    level: 4,
    emoji: "\uD83C\uDFC6",
    shouldTrigger: (ratio) => ratio >= 1,
    buildBody: () => "\u05D9\u05E2\u05D3 \u05D4\u05D5\u05E9\u05DC\u05DD \u05DC\u05D4\u05D9\u05D5\u05DD.",
  },
];

const loadNotifications = () => {
  try {
    return require("expo-notifications");
  } catch {
    return null;
  }
};

const toRtlNotificationText = (text: string) => `${RTL_EMBED}${text}${RTL_RESET}`;

const getReachedMilestone = (todaySteps: number, dailyGoal: number): StepsMilestone | null => {
  if (dailyGoal <= 0 || todaySteps <= 0) {
    return null;
  }

  const ratio = todaySteps / dailyGoal;

  for (let index = MILESTONES.length - 1; index >= 0; index -= 1) {
    const milestone = MILESTONES[index];
    if (milestone?.shouldTrigger(ratio)) {
      return milestone;
    }
  }

  return null;
};

const buildMilestoneTitle = (todaySteps: number, dailyGoal: number, emoji: string) =>
  toRtlNotificationText(
    `${formatSteps(todaySteps)} / ${formatSteps(dailyGoal)} \u05E6\u05E2\u05D3\u05D9\u05DD ${emoji}`
  );

export interface UseStepsNotificationsResult {
  isAvailable: boolean;
  requestPermission: () => Promise<boolean>;
  cancelLegacyDaily: () => Promise<void>;
  notifyMilestone: (todaySteps: number, dailyGoal: number) => Promise<void>;
}

const useStepsNotifications = (): UseStepsNotificationsResult => {
  const notifModuleRef = useRef(loadNotifications());
  const milestoneStateRef = useRef<StoredMilestoneState | null>(null);
  const isAvailable = notifModuleRef.current != null;

  useEffect(() => {
    const Notifications = notifModuleRef.current;
    if (!Notifications) return;

    Notifications.setNotificationHandler?.({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }, []);

  const readMilestoneState = useCallback(async (): Promise<StoredMilestoneState> => {
    const todayKey = getLocalDateKey();
    const cached = milestoneStateRef.current;

    if (cached?.dateKey === todayKey) {
      return cached;
    }

    try {
      const raw = await AsyncStorage.getItem(MILESTONE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredMilestoneState;
        if (parsed?.dateKey === todayKey) {
          milestoneStateRef.current = parsed;
          return parsed;
        }
      }
    } catch {
      // ignore malformed local state
    }

    const nextState = { dateKey: todayKey, lastSentLevel: 0 };
    milestoneStateRef.current = nextState;
    return nextState;
  }, []);

  const writeMilestoneState = useCallback(async (state: StoredMilestoneState): Promise<void> => {
    milestoneStateRef.current = state;

    try {
      await AsyncStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // persistence failure is non-fatal
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const Notifications = notifModuleRef.current;
    if (!Notifications) return false;

    try {
      const existing = await Notifications.getPermissionsAsync();
      if (existing?.status === "granted") return true;

      const requested = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: false, allowSound: false },
      });

      return requested?.status === "granted";
    } catch {
      return false;
    }
  }, []);

  const cancelLegacyDaily = useCallback(async (): Promise<void> => {
    const Notifications = notifModuleRef.current;
    if (!Notifications) return;

    try {
      await Notifications.cancelScheduledNotificationAsync(LEGACY_STEPS_NOTIFICATION_IDENTIFIER);
    } catch {
      // identifier may not exist; ignore
    }
  }, []);

  const notifyMilestone = useCallback(
    async (todaySteps: number, dailyGoal: number): Promise<void> => {
      const Notifications = notifModuleRef.current;
      if (!Notifications) return;

      const permission = await Notifications.getPermissionsAsync();
      if (permission?.status !== "granted") return;

      const milestone = getReachedMilestone(todaySteps, dailyGoal);
      if (!milestone) return;

      const state = await readMilestoneState();
      if (milestone.level <= state.lastSentLevel) {
        return;
      }

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: buildMilestoneTitle(todaySteps, dailyGoal, milestone.emoji),
            body: toRtlNotificationText(milestone.buildBody()),
            data: {
              type: "steps-milestone",
              milestone: milestone.id,
            },
          },
          trigger: null,
        });

        await writeMilestoneState({
          dateKey: state.dateKey,
          lastSentLevel: milestone.level,
        });
      } catch {
        // notification failure is non-fatal
      }
    },
    [readMilestoneState, writeMilestoneState]
  );

  return useMemo(
    () => ({
      isAvailable,
      requestPermission,
      cancelLegacyDaily,
      notifyMilestone,
    }),
    [cancelLegacyDaily, isAvailable, notifyMilestone, requestPermission]
  );
};

export default useStepsNotifications;
