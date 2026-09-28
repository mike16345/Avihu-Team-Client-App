import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useToast } from "@/hooks/useToast";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import WeeklyProgressScreen from "@/screens/WeeklyProgressScreen";
import {
  useWeeklySignatureStore,
  getPreviousWeekKey,
  getCurrentWeekKey,
} from "@/store/weeklySignatureStore";
import { selectionHaptic } from "@/utils/haptics";
import { useWeeklyFeedbackApi } from "@/hooks/api/useWeeklyFeedbackApi";
import { useProgressManualStore, getPreviousWeekDayKeys } from "@/store/progressManualStore";
import { useNutritionDayNotesStore } from "@/store/nutritionDayNotesStore";
import { useSleepAverageStore } from "@/store/sleepAverageStore";
import { useCardioMinutesStore } from "@/store/cardioMinutesStore";
import { useWeeklyFeedbackStore } from "@/store/weeklyFeedbackStore";
import { useUserStore } from "@/store/userStore";
import useWorkoutPlanQuery from "@/hooks/queries/useWorkoutPlanQuery";
import { getWeekDayKeys } from "@/utils/weekKeys";

const PRIMARY = "#072723";
const ACCENT_SOFT = "#EDFFEB";
const MUTED = "#6B7280";
const CARD_BORDER = "rgba(7, 39, 35, 0.08)";

const formatWeekRangeShort = (weekKey: string): string => {
  const [y, m, d] = weekKey.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const dd = (x: Date) => String(x.getDate()).padStart(2, "0");
  const mm = (x: Date) => String(x.getMonth() + 1).padStart(2, "0");
  return `${dd(start)}/${mm(start)} — ${dd(end)}/${mm(end)}`;
};

const WeeklyFeedbackPopupHost: React.FC = () => {
  const previousWeekKey = getPreviousWeekKey();
  const finalizedAt = useWeeklySignatureStore(
    (s) => s.finalizedWeeks[previousWeekKey]
  );
  const finalize = useWeeklySignatureStore((s) => s.finalize);

  const currentUserId = useUserStore((s) => s.currentUser?._id);
  const workoutMarks = useProgressManualStore((s) => s.workoutMarks);
  const { data: workoutPlan } = useWorkoutPlanQuery();
  const nutritionMarks = useProgressManualStore((s) => s.nutritionMarks);
  const dayNotes = useNutritionDayNotesStore((s) => s.notes);
  const sleepHours = useSleepAverageStore((s) => s.hoursByWeek[previousWeekKey] ?? null);
  const cardioMinutes = useCardioMinutesStore((s) => s.minutesByWeek[previousWeekKey] ?? null);
  const feedbackText = useWeeklyFeedbackStore((s) => s.textByWeek[previousWeekKey] ?? "");
  const { upsertWeeklyFeedback, getWeeklyFeedbackByWeek } = useWeeklyFeedbackApi();
  const { triggerErrorToast, triggerSuccessToast } = useToast();
  const queryClient = useQueryClient();

  const previousWeekIso = previousWeekKey;

  const {
    data: serverFeedback,
    isLoading: isServerLoading,
    isFetched: isServerFetched,
  } = useQuery({
    queryKey: ["weekly-feedback-previous", currentUserId, previousWeekKey],
    queryFn: () => getWeeklyFeedbackByWeek(currentUserId!, previousWeekIso),
    enabled: !!currentUserId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isServerFinalized = !!serverFeedback?.finalized;

  useEffect(() => {
    if (isServerFinalized && !finalizedAt) {
      finalize(previousWeekKey);
    }
  }, [isServerFinalized, finalizedAt, previousWeekKey, finalize]);

  const visible =
    !!currentUserId &&
    !isServerLoading &&
    isServerFetched &&
    !finalizedAt &&
    !isServerFinalized;

  const handleFinalize = async () => {
    selectionHaptic();
    if (!currentUserId) {
      finalize(previousWeekKey);
      return;
    }
    const weekStart = previousWeekKey;
    const [y, m, d] = previousWeekKey.split("-").map(Number);
    const weekEndDate = new Date(Date.UTC(y, m - 1, d + 6));
    const weekEnd = weekEndDate.toISOString().slice(0, 10);
    const plans = workoutPlan?.workoutPlans ?? [];
    const previousWeekPrefix = `${previousWeekKey}::`;
    const doneIds = new Set<string>(
      Object.keys(workoutMarks)
        .filter((k) => workoutMarks[k] && k.startsWith(previousWeekPrefix))
        .map((k) => k.slice(previousWeekPrefix.length))
        .filter((id): id is string => !!id)
    );
    const workouts = plans.length
      ? plans.map((p, i) => {
          const planId = p._id ?? `plan-${i}`;
          return {
            planId,
            doneManual: doneIds.has(planId),
            doneSmart: false,
          };
        })
      : Array.from(doneIds).map((planId) => ({
          planId,
          doneManual: true,
          doneSmart: false,
        }));
    const previousWeekDayKeys = new Set(getPreviousWeekDayKeys(previousWeekKey));
    const remappedDaysCompleted = Object.keys(nutritionMarks).filter(
      (k) => !!nutritionMarks[k] && previousWeekDayKeys.has(k)
    );
    const remappedDayNotes: Record<string, string> = {};
    Object.keys(dayNotes).forEach((k) => {
      if (dayNotes[k] && previousWeekDayKeys.has(k)) remappedDayNotes[k] = dayNotes[k];
    });
    try {
      const cardioPlanType = workoutPlan?.cardio?.type;
      const cardioSimple =
        cardioPlanType === "simple"
          ? (workoutPlan?.cardio?.plan as { minsPerWeek?: number })?.minsPerWeek ?? null
          : null;
      await upsertWeeklyFeedback(currentUserId, {
        weekStart,
        weekEnd,
        workouts,
        nutrition: {
          daysCompleted: remappedDaysCompleted,
          dayNotes: remappedDayNotes,
        },
        weighIns: [],
        sleepHours,
        cardioMinutes,
        cardioMinutesGoal: cardioSimple,
        steps: null,
        feedbackText,
        finalized: true,
      });
      finalize(previousWeekKey);
      queryClient.invalidateQueries({
        queryKey: ["weekly-feedback-previous", currentUserId, previousWeekKey],
      });
      triggerSuccessToast({ message: "הפידבק נשלח למאמן" });
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status;
      const message =
        status === 403
          ? "לא ניתן לערוך פידבק ישן. פנה למאמן"
          : status === 401
            ? "ההתחברות פגה. יש להתחבר מחדש"
            : "שליחת הפידבק נכשלה. בדוק חיבור לרשת ונסה שוב";
      triggerErrorToast({ message });
    }
  };

  const currentWeekKey = getCurrentWeekKey();
  const currentSleep = useSleepAverageStore((s) => s.hoursByWeek[currentWeekKey] ?? null);
  const currentCardio = useCardioMinutesStore((s) => s.minutesByWeek[currentWeekKey] ?? null);
  const currentFeedback = useWeeklyFeedbackStore((s) => s.textByWeek[currentWeekKey] ?? "");

  useEffect(() => {
    if (!currentUserId) return;
    const currentDayKeys = new Set(getWeekDayKeys(currentWeekKey));
    const daysCompleted = Object.keys(nutritionMarks).filter(
      (k) => nutritionMarks[k] && currentDayKeys.has(k)
    );
    const currentDayNotes: Record<string, string> = {};
    Object.keys(dayNotes).forEach((k) => {
      if (dayNotes[k] && currentDayKeys.has(k)) currentDayNotes[k] = dayNotes[k];
    });
    const plans = workoutPlan?.workoutPlans ?? [];
    const currentPrefix = `${currentWeekKey}::`;
    const doneIds = new Set<string>(
      Object.keys(workoutMarks)
        .filter((k) => workoutMarks[k] && k.startsWith(currentPrefix))
        .map((k) => k.slice(currentPrefix.length))
        .filter((id): id is string => !!id)
    );
    const workouts = plans.length
      ? plans.map((p, i) => {
          const planId = p._id ?? `plan-${i}`;
          return {
            planId,
            doneManual: doneIds.has(planId),
            doneSmart: false,
          };
        })
      : Array.from(doneIds).map((planId) => ({
          planId,
          doneManual: true,
          doneSmart: false,
        }));
    const cardioPlanType = workoutPlan?.cardio?.type;
    const cardioSimple =
      cardioPlanType === "simple"
        ? (workoutPlan?.cardio?.plan as { minsPerWeek?: number })?.minsPerWeek ?? null
        : null;
    const [y, m, d] = currentWeekKey.split("-").map(Number);
    const weekEndDate = new Date(Date.UTC(y, m - 1, d + 6));
    const weekEnd = weekEndDate.toISOString().slice(0, 10);
    const timer = setTimeout(() => {
      upsertWeeklyFeedback(currentUserId, {
        weekStart: currentWeekKey,
        weekEnd,
        workouts,
        nutrition: { daysCompleted, dayNotes: currentDayNotes },
        weighIns: [],
        sleepHours: currentSleep,
        cardioMinutes: currentCardio,
        cardioMinutesGoal: cardioSimple,
        steps: null,
        feedbackText: currentFeedback,
        finalized: false,
      }).catch(() => {});
    }, 4000);
    return () => clearTimeout(timer);
  }, [
    currentUserId,
    currentWeekKey,
    nutritionMarks,
    dayNotes,
    workoutMarks,
    workoutPlan,
    currentSleep,
    currentCardio,
    currentFeedback,
    upsertWeeklyFeedback,
  ]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <Animated.View
        entering={FadeIn.duration(280)}
        exiting={FadeOut.duration(180)}
        style={styles.backdrop}
      />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={0}
          style={styles.flex1}
        >
          <Animated.View
            entering={FadeInDown.springify().damping(18).mass(0.9)}
            style={styles.card}
          >
            <View style={styles.header}>
              <View style={styles.headerTexts}>
                <Text fontVariant="bold" fontSize={16} style={styles.headerTitle}>
                  השבוע האחרון מוכן לחתימה
                </Text>
                <Text fontSize={12} style={styles.headerSubtitle}>
                  {formatWeekRangeShort(previousWeekKey)}
                </Text>
              </View>
              <View style={styles.lockCircle}>
                <Text fontSize={18}>🔒</Text>
              </View>
            </View>
            <View style={styles.contentWrap}>
              <WeeklyProgressScreen popupMode targetWeekKey={previousWeekKey} />
            </View>
            <View style={styles.footer}>
              <Pressable
                onPress={handleFinalize}
                style={styles.sendBtn}
                accessibilityLabel="שלח פידבק למאמן"
              >
                <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                  <Svg
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                  >
                    <Defs>
                      <SvgLinearGradient id="sendBtnGrad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0%" stopColor="#7BE0A7" stopOpacity={1} />
                        <Stop offset="100%" stopColor="#0F5E3B" stopOpacity={1} />
                      </SvgLinearGradient>
                    </Defs>
                    <Rect
                      x={0}
                      y={0}
                      width={100}
                      height={100}
                      rx={9}
                      ry={9}
                      fill="url(#sendBtnGrad)"
                    />
                  </Svg>
                </View>
                <Text fontVariant="bold" fontSize={15} style={styles.sendBtnText}>
                  שלח פידבק למאמן ✓
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 20, 16, 0.55)",
  },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingVertical: 44 },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  lockCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT_SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTexts: { flex: 1, alignItems: "flex-start" },
  headerTitle: { color: PRIMARY },
  headerSubtitle: { color: MUTED, marginTop: 2 },
  contentWrap: { flex: 1 },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: CARD_BORDER,
    backgroundColor: "#FFFFFF",
  },
  sendBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  sendBtnText: { color: "#FFFFFF" },
});

export default WeeklyFeedbackPopupHost;
