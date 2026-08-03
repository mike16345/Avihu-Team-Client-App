import { FC, useMemo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { MOCK_FOOD_CATALOG } from "../mockFoodCatalog";
import {
  ClockIcon,
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
} from "../dietV2Icons";
import { MealTile } from "./mealTiles";

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
  mealTiles: MealTile[];
}

interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface HistoryEntry {
  entryId: string;
  foodName: string;
  servingLabel: string;
  quantity: number;
  grams: number;
  macros: Macros;
  mealId: string;
}

interface HistoryDay {
  dateLabel: string;
  totals: Macros;
  entries: HistoryEntry[];
  planMealIds: string[];
}

interface MockRow {
  id: string;
  qty: number;
  mealId: string;
}

const YESTERDAY_MOCK: MockRow[] = [
  { id: "food-1", qty: 1, mealId: "meal-1" },
  { id: "food-5", qty: 2, mealId: "meal-1" },
  { id: "food-12", qty: 1.5, mealId: "meal-2" },
  { id: "food-10", qty: 1, mealId: "meal-2" },
  { id: "food-7", qty: 1, mealId: "meal-3" },
  { id: "food-9", qty: 1, mealId: "snack" },
];

const TWO_DAYS_AGO_MOCK: MockRow[] = [
  { id: "food-13", qty: 1, mealId: "meal-1" },
  { id: "food-11", qty: 1, mealId: "meal-2" },
  { id: "food-3", qty: 1, mealId: "snack" },
];

const emptyMacros = (): Macros => ({ calories: 0, protein: 0, carbs: 0, fat: 0 });

const buildHistoryDay = (
  daysAgo: number,
  mocks: MockRow[],
  planMealIds: string[],
): HistoryDay => {
  const entries: HistoryEntry[] = mocks
    .map((m, idx) => {
      const food = MOCK_FOOD_CATALOG.find((f) => f.id === m.id);
      if (!food) return null;
      return {
        entryId: `hist-${daysAgo}-${idx}`,
        foodName: food.name,
        servingLabel: food.servingLabel,
        quantity: m.qty,
        grams: Math.round(m.qty * food.gramsPerServing),
        macros: {
          calories: Math.round(food.macros.calories * m.qty),
          protein: Math.round(food.macros.protein * m.qty),
          carbs: Math.round(food.macros.carbs * m.qty),
          fat: Math.round(food.macros.fat * m.qty),
        },
        mealId: m.mealId,
      };
    })
    .filter((e): e is HistoryEntry => e !== null);

  const totals = entries.reduce((acc, e) => {
    acc.calories += e.macros.calories;
    acc.protein += e.macros.protein;
    acc.carbs += e.macros.carbs;
    acc.fat += e.macros.fat;
    return acc;
  }, emptyMacros());

  return {
    dateLabel: daysAgo === 1 ? "אתמול" : `לפני ${daysAgo} ימים`,
    totals,
    entries,
    planMealIds,
  };
};

const formatQuantity = (quantity: number): string => {
  if (quantity === 1) return "";
  const rounded = Math.round(quantity * 100) / 100;
  return `${rounded}× `;
};

const macrosLine = (m: Macros): string =>
  `${m.calories} קל'  ·  ${m.protein} ח / ${m.carbs} פ / ${m.fat} ש`;

const HistoryModal: FC<HistoryModalProps> = ({ visible, onClose, mealTiles }) => {
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 12);
  const bottomPad = Math.max(insets.bottom, 12);

  const days: HistoryDay[] = useMemo(
    () => [
      buildHistoryDay(1, YESTERDAY_MOCK, ["meal-1", "meal-3"]),
      buildHistoryDay(2, TWO_DAYS_AGO_MOCK, ["meal-1"]),
    ],
    [],
  );

  const mealLabelFor = (mealId: string): string => {
    const tile = mealTiles.find((m) => m.id === mealId);
    if (tile) return tile.label;
    return "לא שויך";
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <View style={styles.headerBar}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
            <Text fontVariant="bold" fontSize={20} style={styles.closeLabel}>
              ×
            </Text>
          </Pressable>
          <View style={styles.titleWrap}>
            <Text fontVariant="bold" fontSize={16} style={styles.title}>
              היסטוריית תיעוד
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {days.map((day) => {
            const byMeal: Record<string, HistoryEntry[]> = {};
            day.entries.forEach((entry) => {
              if (!byMeal[entry.mealId]) byMeal[entry.mealId] = [];
              byMeal[entry.mealId].push(entry);
            });
            const orderedMealIds = [...mealTiles.map((t) => t.id), "unassigned"].filter(
              (id) => byMeal[id] && byMeal[id].length > 0,
            );

            return (
              <View key={day.dateLabel} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayTitleWrap}>
                    <ClockIcon size={14} color={DIET_V2_GREEN} />
                    <Text fontVariant="bold" fontSize={15} style={styles.dayTitle}>
                      {day.dateLabel}
                    </Text>
                  </View>
                </View>

                <View style={styles.dayTotalRow}>
                  <View style={styles.dayTotalBadge}>
                    <Text fontSize={11} fontVariant="semibold" style={styles.dayTotalLabel}>
                      {macrosLine(day.totals)}
                    </Text>
                  </View>
                </View>

                {orderedMealIds.length === 0 ? (
                  <Text fontSize={12} style={styles.emptyText}>
                    לא נרשמו מאכלים
                  </Text>
                ) : (
                  <View style={styles.mealsWrap}>
                    {orderedMealIds.map((mealId) => {
                      const fromPlan = day.planMealIds.includes(mealId);
                      return (
                        <View key={mealId} style={styles.mealBlock}>
                          <View style={styles.mealTitleRow}>
                            <View style={styles.mealTitleWrap}>
                              <Text
                                fontVariant="semibold"
                                fontSize={13}
                                style={styles.mealTitle}
                              >
                                {mealLabelFor(mealId)}
                              </Text>
                            </View>
                            {fromPlan && (
                              <View style={styles.planTag}>
                                <Text
                                  fontSize={9}
                                  fontVariant="bold"
                                  style={styles.planTagLabel}
                                >
                                  ✓ מהתוכנית
                                </Text>
                              </View>
                            )}
                          </View>
                          {byMeal[mealId].map((entry) => (
                            <View key={entry.entryId} style={styles.entryRow}>
                              <View style={styles.entryTextWrap}>
                                <Text
                                  fontVariant="medium"
                                  fontSize={13}
                                  style={styles.entryName}
                                >
                                  {`${formatQuantity(entry.quantity)}${entry.foodName}`}
                                </Text>
                                <Text fontSize={11} style={styles.entryMeta}>
                                  {`${entry.grams} גרם · ${macrosLine(entry.macros)}`}
                                </Text>
                              </View>
                              <View style={styles.entryDot} />
                            </View>
                          ))}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.footerNote}>
            <Text fontSize={11} style={styles.footerText}>
              במצב עיצוב זו היסטוריה לדוגמה. הנתונים האמיתיים יגיעו מהשרת.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9F8",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  closeLabel: {
    color: DIET_V2_DARK,
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    color: DIET_V2_DARK,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  dayCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
    padding: 14,
    gap: 10,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  dayTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dayTitle: {
    color: DIET_V2_DARK,
  },
  dayTotalRow: {
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  dayTotalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: DIET_V2_MINT,
  },
  dayTotalLabel: {
    color: DIET_V2_GREEN,
  },
  mealsWrap: {
    gap: 10,
  },
  mealBlock: {
    gap: 6,
  },
  mealTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    gap: 8,
  },
  mealTitleWrap: {
    flex: 1,
    alignItems: "flex-start",
  },
  mealTitle: {
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  planTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  planTagLabel: {
    color: "#166534",
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FBFDFC",
  },
  entryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DIET_V2_GREEN,
  },
  entryTextWrap: {
    flex: 1,
    alignItems: "flex-start",
  },
  entryName: {
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  entryMeta: {
    color: DIET_V2_MUTED,
    textAlign: "right",
    marginTop: 2,
  },
  emptyText: {
    color: DIET_V2_MUTED,
    textAlign: "center",
    paddingVertical: 12,
  },
  footerNote: {
    paddingVertical: 12,
    alignItems: "center",
  },
  footerText: {
    color: DIET_V2_MUTED,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default HistoryModal;
