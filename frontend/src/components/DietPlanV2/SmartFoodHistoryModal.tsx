import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import { selectionHaptic } from "@/utils/haptics";
import { sumSmartFoodMacros, type SmartFoodEntry } from "./foodCatalog";
import {
  getDietPlanV2SmartFoodsHistoryDayKeys,
  getDietPlanV2SmartFoodsStorageKey,
  reconcileSmartFoodEntries,
} from "./smartFoodStorage";
import {
  ClockIcon,
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
} from "./dietV2Icons";
import { formatDietPlanV2Number } from "./dietPlanV2Utils";

interface SmartFoodHistoryModalProps {
  visible: boolean;
  plan: IDietPlanV2;
  currentEntries: SmartFoodEntry[];
  onClose: () => void;
}

interface SmartFoodHistoryDay {
  dayKey: string;
  entries: SmartFoodEntry[];
}

const parseDayKey = (dayKey: string): Date => {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
};

const formatDayLabel = (dayKey: string, index: number, weekOffset: number): string => {
  if (weekOffset === 0 && index === 0) return "היום";
  if (weekOffset === 0 && index === 1) return "אתמול";
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
  }).format(parseDayKey(dayKey));
};

const formatWeekRange = (dayKeys: string[]): string => {
  const newest = parseDayKey(dayKeys[0]);
  const oldest = parseDayKey(dayKeys[dayKeys.length - 1]);
  const formatter = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "numeric" });
  return `${formatter.format(oldest)}–${formatter.format(newest)}`;
};

const SmartFoodHistoryModal = ({
  visible,
  plan,
  currentEntries,
  onClose,
}: SmartFoodHistoryModalProps) => {
  const insets = useSafeAreaInsets();
  const [weekOffset, setWeekOffset] = useState(0);
  const [openedAt, setOpenedAt] = useState(() => new Date());
  const [days, setDays] = useState<SmartFoodHistoryDay[]>([]);
  const [loading, setLoading] = useState(false);
  const dayKeys = useMemo(
    () => getDietPlanV2SmartFoodsHistoryDayKeys(openedAt, weekOffset),
    [openedAt, weekOffset]
  );

  useEffect(() => {
    if (!visible) return;
    setWeekOffset(0);
    setOpenedAt(new Date());
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setLoading(true);

    const keys = dayKeys.map((dayKey) => getDietPlanV2SmartFoodsStorageKey(plan, dayKey));
    void AsyncStorage.multiGet(keys)
      .then((rows) => {
        if (!active) return;
        setDays(
          rows.map(([, stored], index) => {
            if (weekOffset === 0 && index === 0) {
              return { dayKey: dayKeys[index], entries: currentEntries };
            }
            let parsed: unknown = [];
            try {
              parsed = stored ? JSON.parse(stored) : [];
            } catch {
              parsed = [];
            }
            return { dayKey: dayKeys[index], entries: reconcileSmartFoodEntries(parsed) };
          })
        );
      })
      .catch(() => {
        if (active) setDays(dayKeys.map((dayKey) => ({ dayKey, entries: [] })));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentEntries, dayKeys, plan, visible, weekOffset]);

  const populatedDays = days.filter(({ entries }) => entries.length > 0);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              selectionHaptic();
              onClose();
            }}
            hitSlop={10}
            style={styles.closeButton}
          >
            <Text fontVariant="bold" fontSize={21} style={styles.closeLabel}>
              ×
            </Text>
          </Pressable>
          <Text fontVariant="bold" fontSize={17} style={styles.headerTitle}>
            היסטוריית תיעוד
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.weekNavigation}>
          <Pressable
            onPress={() => {
              selectionHaptic();
              setWeekOffset((current) => current + 1);
            }}
            style={styles.weekButton}
          >
            <Text fontVariant="semibold" fontSize={13} style={styles.weekButtonLabel}>
              שבוע קודם
            </Text>
          </Pressable>
          <View style={styles.weekLabelWrap}>
            <Text fontVariant="bold" fontSize={14} style={styles.weekLabel}>
              {weekOffset === 0 ? "7 הימים האחרונים" : formatWeekRange(dayKeys)}
            </Text>
            {weekOffset === 0 ? (
              <Text fontSize={11} style={styles.weekRange}>
                {formatWeekRange(dayKeys)}
              </Text>
            ) : null}
          </View>
          <Pressable
            disabled={weekOffset === 0}
            onPress={() => {
              selectionHaptic();
              setWeekOffset((current) => Math.max(0, current - 1));
            }}
            style={[styles.weekButton, weekOffset === 0 ? styles.weekButtonDisabled : null]}
          >
            <Text fontVariant="semibold" fontSize={13} style={styles.weekButtonLabel}>
              שבוע הבא
            </Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={DIET_V2_GREEN} />
              <Text fontSize={13} style={styles.emptyText}>
                טוען היסטוריה...
              </Text>
            </View>
          ) : null}

          {!loading && populatedDays.length === 0 ? (
            <View style={styles.emptyState}>
              <ClockIcon size={30} color={DIET_V2_MUTED} />
              <Text fontVariant="semibold" fontSize={15} style={styles.emptyTitle}>
                אין רישומים בשבוע הזה
              </Text>
              <Text fontSize={12} style={styles.emptyText}>
                אפשר לעבור לשבוע קודם או לחזור ולסרוק מוצר חדש.
              </Text>
            </View>
          ) : null}

          {!loading
            ? populatedDays.map((day) => {
                const dayIndex = dayKeys.indexOf(day.dayKey);
                const totals = sumSmartFoodMacros(day.entries);
                return (
                  <View key={day.dayKey} style={styles.dayCard}>
                    <View style={styles.dayHeader}>
                      <ClockIcon size={16} color={DIET_V2_GREEN} />
                      <Text fontVariant="bold" fontSize={15} style={styles.dayTitle}>
                        {formatDayLabel(day.dayKey, dayIndex, weekOffset)}
                      </Text>
                    </View>
                    <View style={styles.totalBadge}>
                      <Text fontVariant="semibold" fontSize={11} style={styles.totalLabel}>
                        {`${formatDietPlanV2Number(totals.calories)} קק"ל · ${formatDietPlanV2Number(totals.protein)} חלבון · ${formatDietPlanV2Number(totals.carbs)} פחמימה · ${formatDietPlanV2Number(totals.fat)} שומן`}
                      </Text>
                    </View>
                    {day.entries.map((entry) => (
                      <View key={entry.id} style={styles.entryRow}>
                        <View style={styles.entryCopy}>
                          <Text fontVariant="semibold" fontSize={14} style={styles.entryName}>
                            {entry.name}
                          </Text>
                          <Text fontSize={11} style={styles.entryMeta}>
                            {`${formatDietPlanV2Number(entry.servingCount)} × ${entry.servingDescription} · ${formatDietPlanV2Number(entry.macros.calories)} קק"ל`}
                          </Text>
                        </View>
                        <View style={styles.entryDot} />
                      </View>
                    ))}
                  </View>
                );
              })
            : null}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9F8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
  },
  closeLabel: { color: DIET_V2_DARK, lineHeight: 23 },
  headerTitle: { flex: 1, color: DIET_V2_DARK, textAlign: "center" },
  headerSpacer: { width: 38 },
  weekNavigation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  weekButton: {
    minWidth: 82,
    minHeight: 38,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
  },
  weekButtonDisabled: { opacity: 0.35 },
  weekButtonLabel: { color: DIET_V2_DARK, textAlign: "center" },
  weekLabelWrap: { flex: 1, alignItems: "center", gap: 1 },
  weekLabel: { color: DIET_V2_DARK, textAlign: "center", fontVariant: ["tabular-nums"] },
  weekRange: { color: DIET_V2_MUTED, textAlign: "center", fontVariant: ["tabular-nums"] },
  content: { padding: 16, gap: 14 },
  loadingState: { alignItems: "center", gap: 10, paddingVertical: 50 },
  emptyState: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
  },
  emptyTitle: { width: "100%", color: DIET_V2_DARK, textAlign: "center" },
  emptyText: { width: "100%", color: DIET_V2_MUTED, textAlign: "center" },
  dayCard: {
    padding: 14,
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
  },
  dayHeader: { flexDirection: "row", alignItems: "center", gap: 7 },
  dayTitle: { flex: 1, color: DIET_V2_DARK },
  totalBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: DIET_V2_MINT,
  },
  totalLabel: { color: DIET_V2_GREEN, textAlign: "right" },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FBFDFC",
  },
  entryDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: DIET_V2_GREEN },
  entryCopy: { flex: 1, alignItems: "flex-start" },
  entryName: { width: "100%", color: DIET_V2_DARK },
  entryMeta: { width: "100%", color: DIET_V2_MUTED },
});

export default SmartFoodHistoryModal;
