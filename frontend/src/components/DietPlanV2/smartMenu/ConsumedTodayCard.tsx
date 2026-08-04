import { FC } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { ConsumedFoodEntry, NoteReminderEntry } from "../mockFoodCatalog";
import {
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
} from "../dietV2Icons";
import { MealTile } from "./mealTiles";
import { smartMenuStyles } from "./smartMenuShared";

interface ConsumedTodayCardProps {
  consumed: ConsumedFoodEntry[];
  notes: NoteReminderEntry[];
  onRemove: (entryId: string) => void;
  onRemoveNote: (entryId: string) => void;
  onOpenNote: () => void;
  mealTiles: MealTile[];
}

const groupByMeal = (entries: ConsumedFoodEntry[]): Record<string, ConsumedFoodEntry[]> => {
  const groups: Record<string, ConsumedFoodEntry[]> = {};
  entries.forEach((entry) => {
    const key = entry.mealId ?? "unassigned";
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });
  return groups;
};

const groupNotesByMeal = (entries: NoteReminderEntry[]): Record<string, NoteReminderEntry[]> => {
  const groups: Record<string, NoteReminderEntry[]> = {};
  entries.forEach((entry) => {
    const key = entry.mealId ?? "unassigned";
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });
  return groups;
};

const mealLabelFor = (mealId: string, mealTiles: MealTile[]): string => {
  const tile = mealTiles.find((m) => m.id === mealId);
  if (tile) return tile.label;
  return "לא שויך";
};

interface MealTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const totalMacros = (entries: ConsumedFoodEntry[]): MealTotals => {
  const acc = entries.reduce(
    (a, e) => {
      a.calories += e.food.macros.calories * e.quantity;
      a.protein += e.food.macros.protein * e.quantity;
      a.carbs += e.food.macros.carbs * e.quantity;
      a.fat += e.food.macros.fat * e.quantity;
      return a;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return {
    calories: Math.round(acc.calories),
    protein: Math.round(acc.protein),
    carbs: Math.round(acc.carbs),
    fat: Math.round(acc.fat),
  };
};

const ConsumedTodayCard: FC<ConsumedTodayCardProps> = ({
  consumed,
  notes,
  onRemove,
  onRemoveNote,
  onOpenNote,
  mealTiles,
}) => {
  const isEmpty = consumed.length === 0 && notes.length === 0;

  if (isEmpty) {
    return (
      <View style={smartMenuStyles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <Text fontVariant="bold" fontSize={16} style={styles.headerTitle}>
              מה אכלת היום
            </Text>
          </View>
          <Pressable onPress={onOpenNote} style={styles.addNoteBtn}>
            <Text fontVariant="semibold" fontSize={11} style={styles.addNoteLabel}>
              תיעוד בלי חישוב
            </Text>
            <Text fontVariant="bold" fontSize={13} style={styles.addNoteIcon}>
              +
            </Text>
          </Pressable>
        </View>
        <View style={styles.emptyWrap}>
          <Text fontSize={13} style={styles.emptyText}>
            עדיין לא נרשמו מאכלים היום
          </Text>
        </View>
      </View>
    );
  }

  const consumedGroups = groupByMeal(consumed);
  const noteGroups = groupNotesByMeal(notes);
  const allMealIds = new Set<string>([...Object.keys(consumedGroups), ...Object.keys(noteGroups)]);
  const orderedMealIds = [...mealTiles.map((t) => t.id), "unassigned"].filter((id) =>
    allMealIds.has(id)
  );

  return (
    <View style={smartMenuStyles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text fontVariant="bold" fontSize={16} style={styles.headerTitle}>
            מה אכלת היום
          </Text>
        </View>
        <Pressable onPress={onOpenNote} style={styles.addNoteBtn}>
          <Text fontVariant="bold" fontSize={12} style={styles.addNoteLabel}>
            + לזכרון
          </Text>
        </Pressable>
      </View>

      <View style={styles.sectionsWrap}>
        {orderedMealIds.map((mealId) => {
          const entries = consumedGroups[mealId] ?? [];
          const mealNotes = noteGroups[mealId] ?? [];
          const totals = entries.length > 0 ? totalMacros(entries) : null;
          return (
            <View key={mealId} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleWrap}>
                  <Text fontVariant="bold" fontSize={14} style={styles.sectionTitle}>
                    {mealLabelFor(mealId, mealTiles)}
                  </Text>
                </View>
              </View>
              {totals && (
                <View style={styles.macrosRow}>
                  <View style={styles.macrosBadge}>
                    <Text fontSize={11} fontVariant="semibold" style={styles.macrosBadgeText}>
                      {`${totals.calories} קק"ל  ·  ${totals.protein} ח / ${totals.carbs} פ / ${totals.fat} ש`}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.itemsWrap}>
                {entries.map((entry) => {
                  const totalGrams = Math.round(entry.quantity * entry.food.gramsPerServing);
                  const totalCal = Math.round(entry.food.macros.calories * entry.quantity);
                  return (
                    <View key={entry.entryId} style={styles.itemRow}>
                      <View style={styles.itemTextWrap}>
                        <Text fontVariant="medium" fontSize={14} style={styles.itemName}>
                          {entry.food.name}
                        </Text>
                        <Text fontSize={12} style={styles.itemMeta}>
                          {`${totalGrams} גרם · ${totalCal} קק"ל`}
                        </Text>
                      </View>
                      <Pressable
                        hitSlop={8}
                        onPress={() => onRemove(entry.entryId)}
                        style={styles.removeBtn}
                      >
                        <Text fontVariant="bold" fontSize={16} style={styles.removeLabel}>
                          ×
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}

                {mealNotes.map((note) => (
                  <View key={note.entryId} style={styles.noteRow}>
                    <View style={styles.noteBadge}>
                      <Text fontSize={9} fontVariant="bold" style={styles.noteBadgeLabel}>
                        לזכרון
                      </Text>
                    </View>
                    <View style={styles.itemTextWrap}>
                      <Text fontSize={13} style={styles.noteText}>
                        {note.text}
                      </Text>
                      <Text fontSize={11} style={styles.noteMeta}>
                        לא מחושב בקלוריות
                      </Text>
                    </View>
                    <Pressable
                      hitSlop={8}
                      onPress={() => onRemoveNote(note.entryId)}
                      style={styles.removeBtn}
                    >
                      <Text fontVariant="bold" fontSize={16} style={styles.removeLabel}>
                        ×
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    gap: 8,
  },
  titleWrap: {
    alignItems: "flex-start",
    flex: 1,
  },
  headerTitle: {
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  addNoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    backgroundColor: "#F0FDF4",
  },
  addNoteLabel: {
    color: "#166534",
  },
  addNoteIcon: {
    color: "#16A34A",
  },
  emptyWrap: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    color: DIET_V2_MUTED,
    textAlign: "center",
  },
  sectionsWrap: {
    marginTop: 12,
    gap: 14,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionTitleWrap: {
    flex: 1,
    alignItems: "flex-start",
  },
  sectionTitle: {
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  macrosRow: {
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  macrosBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: DIET_V2_MINT,
  },
  macrosBadgeText: {
    color: DIET_V2_GREEN,
  },
  itemsWrap: {
    gap: 6,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FBFDFC",
  },
  itemTextWrap: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  itemName: {
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  itemMeta: {
    color: DIET_V2_MUTED,
    textAlign: "right",
    marginTop: 2,
  },
  removeBtn: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  removeLabel: {
    color: DIET_V2_MUTED,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
  },
  noteBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#DCFCE7",
  },
  noteBadgeLabel: {
    color: "#166534",
  },
  noteText: {
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  noteMeta: {
    color: "#4B7A62",
    textAlign: "right",
    marginTop: 2,
    fontStyle: "italic",
  },
});

export default ConsumedTodayCard;
