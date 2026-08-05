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
  storageKey: string;
  dateKey: string;
  lastSentLevel: number;
}

let milestoneStateCache: StoredMilestoneState | null = null;

const ONE_QUARTER = 0.25;
const ONE_HALF = 0.5;
const TWO_THIRDS = 2 / 3;
const WHOLE_GOAL = 1;

const MILESTONES: StepsMilestone[] = [
  {
    id: "quarter",
    level: 1,
    emoji: "👣",
    shouldTrigger: (ratio) => ratio >= ONE_QUARTER,
    buildBody: () => "התחלה טובה, ממשיכים לזוז.",
  },
  {
    id: "half",
    level: 2,
    emoji: "🚀",
    shouldTrigger: (ratio) => ratio >= ONE_HALF,
    buildBody: () => "כבר עברת את חצי הדרך.",
  },
  {
    id: "twoThirds",
    level: 3,
    emoji: "🔥",
    shouldTrigger: (ratio) => ratio >= TWO_THIRDS,
    buildBody: () => "עוד קצת ואתה סוגר את היעד.",
  },
  {
    id: "complete",
    level: 4,
    emoji: "🏆",
    shouldTrigger: (ratio) => ratio >= WHOLE_GOAL,
    buildBody: () => "יעד הושלם להיום.",
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
  toRtlNotificationText(`${formatSteps(todaySteps)} / ${formatSteps(dailyGoal)} צעדים ${emoji}`);

export interface UseStepsNotificationsResult {
  isAvailable: boolean;
  requestPermission: () => Promise<boolean>;
  cancelLegacyDaily: () => Promise<void>;
  notifyMilestone: (
    todaySteps: number,
    dailyGoal: number,
    userId: string,
  ) => Promise<void>;
}

const getMilestoneStorageKey = (userId: string) => `${MILESTONE_STORAGE_KEY}:${userId}`;

const readMilestoneState = async (userId: string): Promise<StoredMilestoneState> => {
  const todayKey = getLocalDateKey();
  const storageKey = getMilestoneStorageKey(userId);

  if (
    milestoneStateCache?.storageKey === storageKey &&
    milestoneStateCache.dateKey === todayKey
  ) {
    return milestoneStateCache;
  }

  try {
    const raw = await AsyncStorage.getItem(storageKey);

    if (raw) {
      const parsed = JSON.parse(raw) as Omit<StoredMilestoneState, "storageKey">;

      if (parsed?.dateKey === todayKey) {
        milestoneStateCache = { ...parsed, storageKey };
        return milestoneStateCache;
      }
    }
  } catch {
    // ignore malformed local state
  }

  milestoneStateCache = { storageKey, dateKey: todayKey, lastSentLevel: 0 };
  return milestoneStateCache;
};

const writeMilestoneState = async (state: StoredMilestoneState): Promise<void> => {
  milestoneStateCache = state;

  try {
    await AsyncStorage.setItem(
      state.storageKey,
      JSON.stringify({
        dateKey: state.dateKey,
        lastSentLevel: state.lastSentLevel,
      })
    );
  } catch {
    // persistence failure is non-fatal
  }
};

export const notifyStepsMilestone = async (
  todaySteps: number,
  dailyGoal: number,
  userId: string,
): Promise<void> => {
  const Notifications = loadNotifications();
  if (!Notifications || !userId) return;

  const permission = await Notifications.getPermissionsAsync();
  if (permission?.status !== "granted") return;

  const milestone = getReachedMilestone(todaySteps, dailyGoal);
  if (!milestone) return;

  const state = await readMilestoneState(userId);
  if (milestone.level <= state.lastSentLevel) return;

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
      storageKey: state.storageKey,
      dateKey: state.dateKey,
      lastSentLevel: milestone.level,
    });
  } catch {
    // notification failure is non-fatal
  }
};

const useStepsNotifications = (): UseStepsNotificationsResult => {
  const notifModuleRef = useRef(loadNotifications());
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

  const notifyMilestone = useCallback(notifyStepsMilestone, []);

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
