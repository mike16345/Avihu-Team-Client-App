import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import Icon from "@/components/Icon/Icon";
import WeeklyProgressScreen from "@/screens/WeeklyProgressScreen";
import { useWeeklyFeedbackApi } from "@/hooks/api/useWeeklyFeedbackApi";
import { IWeeklyFeedback } from "@/interfaces/WeeklyFeedback";

const PRIMARY = "#072723";
const ACCENT_SOFT = "#EDFFEB";
const MUTED = "#6B7280";
const CARD_BORDER = "rgba(7, 39, 35, 0.08)";

const formatWeekRangeFromKey = (weekKey: string): string => {
  const [y, m, d] = weekKey.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const dd = (x: Date) => String(x.getDate()).padStart(2, "0");
  const mm = (x: Date) => String(x.getMonth() + 1).padStart(2, "0");
  return `${dd(start)}/${mm(start)} — ${dd(end)}/${mm(end)}`;
};

interface Props {
  visible: boolean;
  userId: string | undefined;
  weekKey: string;
  onClose: () => void;
}

const PastWeekViewerModal: React.FC<Props> = ({ visible, userId, weekKey, onClose }) => {
  const { getWeeklyFeedbackByWeek } = useWeeklyFeedbackApi();
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState<IWeeklyFeedback | null>(null);

  useEffect(() => {
    if (!visible || !userId) return;
    let cancelled = false;
    setLoading(true);
    setDoc(null);
    const [y, m, d] = weekKey.split("-").map(Number);
    const weekStartIso = new Date(y, m - 1, d).toISOString();
    getWeeklyFeedbackByWeek(userId, weekStartIso)
      .then((res) => {
        if (!cancelled) setDoc(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, userId, weekKey]);

  const historicData = useMemo(() => {
    if (!doc) return null;
    const workoutMarksMap: Record<string, boolean> = {};
    (doc.workouts || []).forEach((w, i) => {
      if (w.doneManual || w.doneSmart) {
        workoutMarksMap[`${weekKey}::${w.planId || `plan-${i}`}`] = true;
      }
    });
    const nutritionMarksMap: Record<string, boolean> = {};
    (doc.nutrition?.daysCompleted || []).forEach((day) => {
      nutritionMarksMap[day] = true;
    });
    const dayNotesMap: Record<string, string> = { ...(doc.nutrition?.dayNotes || {}) };
    return {
      workoutsDone: workoutMarksMap,
      nutritionMarks: nutritionMarksMap,
      dayNotes: dayNotesMap,
      sleepHours: doc.sleepHours ?? null,
      cardioMinutes: doc.cardioMinutes ?? null,
      feedbackText: doc.feedbackText || "",
    };
  }, [doc, weekKey]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop} />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex1}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerTexts}>
                <Text fontVariant="bold" fontSize={16} style={styles.headerTitle}>
                  השבוע הקודם 🔒
                </Text>
                <Text fontSize={12} style={styles.headerSubtitle}>
                  {formatWeekRangeFromKey(weekKey)}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={styles.closeBtn}
                accessibilityLabel="סגירה"
              >
                <Icon name="closeSoft" color={PRIMARY} width={20} height={20} />
              </Pressable>
            </View>
            <View style={styles.contentWrap}>
              {loading ? (
                <View style={styles.center}>
                  <Text fontSize={13} style={{ color: MUTED }}>
                    טוען נתוני שבוע…
                  </Text>
                </View>
              ) : !historicData ? (
                <View style={styles.center}>
                  <Text fontSize={13} style={{ color: MUTED }}>
                    אין נתונים לשבוע הזה
                  </Text>
                </View>
              ) : (
                <WeeklyProgressScreen
                  popupMode
                  historicData={historicData}
                  historicWeekKey={weekKey}
                />
              )}
            </View>
          </View>
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
  safeArea: { flex: 1, paddingHorizontal: 20, paddingVertical: 28 },
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
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  headerTexts: { flex: 1, alignItems: "flex-start" },
  headerTitle: { color: PRIMARY, textAlign: "right" },
  headerSubtitle: { color: MUTED, textAlign: "right", marginTop: 2 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT_SOFT,
    borderWidth: 1.5,
    borderColor: "rgba(11, 42, 34, 0.22)",
  },
  contentWrap: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});

export default PastWeekViewerModal;
