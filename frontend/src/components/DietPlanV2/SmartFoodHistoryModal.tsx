import { semanticColors } from "@/themes/semanticColors";
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import { selectionHaptic } from "@/utils/haptics";
import type { SmartFoodEntry } from "./foodCatalog";
import {
  getDietPlanV2SmartFoodsHistoryDayKeys,
  getDietPlanV2SmartFoodsStorageKey,
  reconcileSmartFoodEntries,
} from "./smartFoodStorage";
import {
  getDietPlanV2ConsumptionStorageKey,
  reconcileDietPlanV2Completion,
  type DietPlanV2CompletionMap,
} from "./dietPlanV2Consumption";
import {
  buildDietPlanV2HistoryEntries,
  sumDietPlanV2HistoryMacros,
  type DietPlanV2HistoryEntry,
} from "./dietPlanV2History";
import {
  ClockIcon,
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
} from "./dietV2Icons";
import { formatDietPlanV2Number } from "./dietPlanV2Utils";
import useStyles from "@/styles/useGlobalStyles";

interface SmartFoodHistoryModalProps {
  visible: boolean;
  plan: IDietPlanV2;
  currentEntries: SmartFoodEntry[];
  currentCompletion: DietPlanV2CompletionMap;
  onClose: () => void;
}

interface SmartFoodHistoryDay {
  dayKey: string;
  entries: DietPlanV2HistoryEntry[];
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
  currentCompletion,
  onClose,
}: SmartFoodHistoryModalProps) => {
  const insets = useSafeAreaInsets();
  const { layout } = useStyles();
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

    const keys = dayKeys.flatMap((dayKey) => [
      getDietPlanV2SmartFoodsStorageKey(plan, dayKey),
      getDietPlanV2ConsumptionStorageKey(plan, dayKey),
    ]);
    void AsyncStorage.multiGet(keys)
      .then((rows) => {
        if (!active) return;
        const storedByKey = new Map(rows);
        setDays(
          dayKeys.map((dayKey, index) => {
            if (weekOffset === 0 && index === 0) {
              return {
                dayKey,
                entries: buildDietPlanV2HistoryEntries(plan, currentCompletion, currentEntries),
              };
            }
            let parsedSmartFoods: unknown = [];
            let parsedCompletion: unknown = {};
            try {
              const stored = storedByKey.get(getDietPlanV2SmartFoodsStorageKey(plan, dayKey));
              parsedSmartFoods = stored ? JSON.parse(stored) : [];
            } catch {
              parsedSmartFoods = [];
            }
            try {
              const stored = storedByKey.get(getDietPlanV2ConsumptionStorageKey(plan, dayKey));
              parsedCompletion = stored ? JSON.parse(stored) : {};
            } catch {
              parsedCompletion = {};
            }
            return {
              dayKey,
              entries: buildDietPlanV2HistoryEntries(
                plan,
                reconcileDietPlanV2Completion(plan, parsedCompletion),
                reconcileSmartFoodEntries(parsedSmartFoods)
              ),
            };
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
  }, [currentCompletion, currentEntries, dayKeys, plan, visible, weekOffset]);

  const populatedDays = days.filter(({ entries }) => entries.length > 0);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={[
          layout.flex1,
          styles.container,
          { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={[layout.flexRow, layout.itemsCenter, styles.header]}>
          <Pressable
            onPress={() => {
              selectionHaptic();
              onClose();
            }}
            hitSlop={10}
            style={[layout.itemsCenter, layout.justifyCenter, styles.closeButton]}
          >
            <Text fontVariant="bold" fontSize={21} style={styles.closeLabel}>
              ×
            </Text>
          </Pressable>
          <Text fontVariant="bold" fontSize={17} style={[layout.flex1, styles.headerTitle]}>
            היסטוריית תיעוד
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[layout.flexRow, layout.itemsCenter, styles.weekNavigation]}>
          <Pressable
            onPress={() => {
              selectionHaptic();
              setWeekOffset((current) => current + 1);
            }}
            style={[layout.itemsCenter, layout.justifyCenter, styles.weekButton]}
          >
            <Text fontVariant="semibold" fontSize={13} style={styles.weekButtonLabel}>
              שבוע קודם
            </Text>
          </Pressable>
          <View style={[layout.flex1, layout.itemsCenter, styles.weekLabelWrap]}>
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
            style={[
              layout.itemsCenter,
              layout.justifyCenter,
              styles.weekButton,
              weekOffset === 0 ? styles.weekButtonDisabled : null,
            ]}
          >
            <Text fontVariant="semibold" fontSize={13} style={styles.weekButtonLabel}>
              שבוע הבא
            </Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={[layout.itemsCenter, styles.loadingState]}>
              <ActivityIndicator color={DIET_V2_GREEN} />
              <Text fontSize={13} style={[layout.widthFull, styles.emptyText]}>
                טוען היסטוריה...
              </Text>
            </View>
          ) : null}

          {!loading && populatedDays.length === 0 ? (
            <View style={[layout.itemsCenter, layout.justifyCenter, styles.emptyState]}>
              <ClockIcon size={30} color={DIET_V2_MUTED} />
              <Text
                fontVariant="semibold"
                fontSize={15}
                style={[layout.widthFull, styles.emptyTitle]}
              >
                אין רישומים בשבוע הזה
              </Text>
              <Text fontSize={12} style={[layout.widthFull, styles.emptyText]}>
                אפשר לעבור לשבוע קודם או לחזור ולסרוק מוצר חדש.
              </Text>
            </View>
          ) : null}

          {!loading
            ? populatedDays.map((day) => {
                const dayIndex = dayKeys.indexOf(day.dayKey);
                const totals = sumDietPlanV2HistoryMacros(day.entries);

                return (
                  <View key={day.dayKey} style={styles.dayCard}>
                    <View style={[layout.flexRow, layout.itemsCenter, styles.dayHeader]}>
                      <ClockIcon size={16} color={DIET_V2_GREEN} />
                      <Text
                        fontVariant="bold"
                        fontSize={15}
                        style={[layout.flex1, styles.dayTitle]}
                      >
                        {formatDayLabel(day.dayKey, dayIndex, weekOffset)}
                      </Text>
                    </View>
                    <View style={[layout.alignSelfStart, styles.totalBadge]}>
                      <Text fontVariant="semibold" fontSize={11} style={styles.totalLabel}>
                        {`${formatDietPlanV2Number(totals.calories)} קק"ל · ${formatDietPlanV2Number(totals.protein)} חלבון · ${formatDietPlanV2Number(totals.carbs)} פחמימה · ${formatDietPlanV2Number(totals.fat)} שומן`}
                      </Text>
                    </View>
                    {day.entries.map((entry) => (
                      <View
                        key={entry.id}
                        style={[layout.flexRow, layout.itemsCenter, styles.entryRow]}
                      >
                        <View style={styles.entryDot} />
                        <View style={[layout.flex1, layout.itemsStart]}>
                          <Text
                            fontVariant="semibold"
                            fontSize={14}
                            style={[layout.widthFull, styles.entryName]}
                          >
                            {entry.name}
                          </Text>
                          <Text fontSize={11} style={[layout.widthFull, styles.entryMeta]}>
                            {`${entry.detail}${entry.macros.calories > 0 ? ` · ${formatDietPlanV2Number(entry.macros.calories)} קק"ל` : ""}`}
                          </Text>
                        </View>
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
  container: { backgroundColor: semanticColors.surfaceSubtle },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: semanticColors.app.surfaceRaised,
  },
  closeLabel: { color: DIET_V2_DARK, lineHeight: 23 },
  headerTitle: { color: DIET_V2_DARK, textAlign: "center" },
  headerSpacer: { width: 38 },
  weekNavigation: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  weekButton: {
    minWidth: 82,
    minHeight: 38,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: semanticColors.app.surfaceRaised,
  },
  weekButtonDisabled: { opacity: 0.35 },
  weekButtonLabel: { color: DIET_V2_DARK, textAlign: "center" },
  weekLabelWrap: { gap: 1 },
  weekLabel: { color: DIET_V2_DARK, textAlign: "center", fontVariant: ["tabular-nums"] },
  weekRange: { color: DIET_V2_MUTED, textAlign: "center", fontVariant: ["tabular-nums"] },
  content: { padding: 16, gap: 14 },
  loadingState: { gap: 10, paddingVertical: 50 },
  emptyState: {
    minHeight: 220,
    gap: 8,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: semanticColors.app.surfaceRaised,
  },
  emptyTitle: { color: DIET_V2_DARK, textAlign: "center" },
  emptyText: { color: DIET_V2_MUTED, textAlign: "center" },
  dayCard: {
    padding: 14,
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: semanticColors.app.surfaceRaised,
  },
  dayHeader: { gap: 7 },
  dayTitle: { color: DIET_V2_DARK },
  totalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: DIET_V2_MINT,
  },
  totalLabel: { color: DIET_V2_GREEN },
  entryRow: {
    gap: 9,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: semanticColors.app.dietHistorySurface,
  },
  entryDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: DIET_V2_GREEN },
  entryName: { color: DIET_V2_DARK },
  entryMeta: { color: DIET_V2_MUTED },
});

export default SmartFoodHistoryModal;
