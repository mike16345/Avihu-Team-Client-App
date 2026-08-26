import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import WeeklyProgressScreen from "@/screens/WeeklyProgressScreen";
import {
  useWeeklySignatureStore,
  getPreviousWeekKey,
} from "@/store/weeklySignatureStore";
import { selectionHaptic } from "@/utils/haptics";
import { useWeeklyFeedbackApi } from "@/hooks/api/useWeeklyFeedbackApi";
import { useProgressManualStore } from "@/store/progressManualStore";
import { useNutritionDayNotesStore } from "@/store/nutritionDayNotesStore";
import { useSleepAverageStore } from "@/store/sleepAverageStore";
import { useCardioMinutesStore } from "@/store/cardioMinutesStore";
import { useWeeklyFeedbackStore } from "@/store/weeklyFeedbackStore";
import { useUserStore } from "@/store/userStore";
import useWorkoutPlanQuery from "@/hooks/queries/useWorkoutPlanQuery";

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
  const visible = !finalizedAt;

  const currentUserId = useUserStore((s) => s.currentUser?._id);
  const workoutMarks = useProgressManualStore((s) => s.workoutMarks);
  const { data: workoutPlan } = useWorkoutPlanQuery();
  const nutritionMarks = useProgressManualStore((s) => s.nutritionMarks);
  const dayNotes = useNutritionDayNotesStore((s) => s.notes);
  const sleepHours = useSleepAverageStore((s) => s.hours);
  const cardioMinutes = useCardioMinutesStore((s) => s.minutes);
  const feedbackText = useWeeklyFeedbackStore((s) => s.text);
  const { upsertWeeklyFeedback } = useWeeklyFeedbackApi();

  const handleFinalize = async () => {
    selectionHaptic();
    if (!currentUserId) {
      finalize(previousWeekKey);
      return;
    }
    const [y, m, d] = previousWeekKey.split("-").map(Number);
    const weekStart = new Date(y, m - 1, d);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const plans = workoutPlan?.workoutPlans ?? [];
    const doneIds = new Set<string>(
      Object.keys(workoutMarks)
        .filter((k) => workoutMarks[k])
        .map((k) => k.split("::")[1])
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
    const remapDayKeyToPreviousWeek = (originalKey: string): string => {
      const parts = originalKey.split("-").map(Number);
      if (parts.length !== 3 || parts.some(isNaN)) return originalKey;
      const original = new Date(parts[0], parts[1] - 1, parts[2]);
      const dayOfWeek = original.getDay();
      const remapped = new Date(weekStart);
      remapped.setDate(weekStart.getDate() + dayOfWeek);
      const yy = remapped.getFullYear();
      const mm = String(remapped.getMonth() + 1).padStart(2, "0");
      const dd = String(remapped.getDate()).padStart(2, "0");
      return `${yy}-${mm}-${dd}`;
    };
    const remappedDaysCompleted = Object.keys(nutritionMarks)
      .filter((k) => !!nutritionMarks[k])
      .map(remapDayKeyToPreviousWeek);
    const remappedDayNotes: Record<string, string> = {};
    Object.keys(dayNotes).forEach((k) => {
      if (dayNotes[k]) remappedDayNotes[remapDayKeyToPreviousWeek(k)] = dayNotes[k];
    });
    try {
      const cardioPlanType = workoutPlan?.cardio?.type;
      const cardioSimple =
        cardioPlanType === "simple"
          ? (workoutPlan?.cardio?.plan as { minsPerWeek?: number })?.minsPerWeek ?? null
          : null;
      await upsertWeeklyFeedback(currentUserId, {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
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
      } as unknown as import("@/interfaces/WeeklyFeedback").IWeeklyFeedbackPayload);
    } catch (err) {
      console.log("weekly feedback upsert failed:", err);
    }
    finalize(previousWeekKey);
  };

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
              <WeeklyProgressScreen popupMode />
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
