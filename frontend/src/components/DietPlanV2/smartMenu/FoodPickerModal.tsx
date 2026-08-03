import { FC, useMemo, useState } from "react";
import { Keyboard, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { selectionHaptic } from "@/utils/haptics";
import { MOCK_FOOD_CATALOG, MockFoodItem } from "../mockFoodCatalog";
import FoodQuantityModal from "./FoodQuantityModal";
import { MealTile } from "./mealTiles";
import {
  ClockIcon,
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
  FlameIcon,
  SearchIcon,
} from "../dietV2Icons";

interface FoodPickerModalProps {
  visible: boolean;
  recent: MockFoodItem[];
  onSelect: (food: MockFoodItem) => void;
  onClose: () => void;
  pendingFood: MockFoodItem | null;
  defaultMealId: string;
  onQuantityCancel: () => void;
  onQuantityConfirm: (quantity: number, mealId: string) => void;
  mealTiles: MealTile[];
  onAddMeal: () => string;
}

const POPULAR_IDS = ["food-2", "food-7", "food-10", "food-12", "food-13"];

const FoodRow: FC<{ food: MockFoodItem; onSelect: (f: MockFoodItem) => void }> = ({
  food,
  onSelect,
}) => {
  const macros = food.macros;
  const macroLine = `${Math.round(macros.calories)} קל' · ${Math.round(macros.protein)} ח / ${Math.round(macros.carbs)} פ / ${Math.round(macros.fat)} ש`;
  return (
    <Pressable
      style={styles.row}
      onPress={() => {
        selectionHaptic();
        onSelect(food);
      }}
    >
      <View style={styles.addBtn}>
        <Text fontVariant="bold" fontSize={18} style={styles.addBtnLabel}>
          +
        </Text>
      </View>
      <View style={styles.rowTextWrap}>
        <Text fontVariant="bold" fontSize={14} style={styles.rowName}>
          {food.name}
        </Text>
        <Text fontSize={12} style={styles.rowMeta}>
          {macroLine}
        </Text>
        <Text fontSize={11} style={styles.rowServing}>
          {food.servingLabel}
        </Text>
      </View>
    </Pressable>
  );
};

const FoodPickerModal: FC<FoodPickerModalProps> = ({
  visible,
  recent,
  onSelect,
  onClose,
  pendingFood,
  defaultMealId,
  onQuantityCancel,
  onQuantityConfirm,
  mealTiles,
  onAddMeal,
}) => {
  const [query, setQuery] = useState("");
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 12);
  const bottomPad = Math.max(insets.bottom, 12);

  const popular = useMemo(
    () =>
      POPULAR_IDS.map((id) => MOCK_FOOD_CATALOG.find((f) => f.id === id)).filter(
        (x): x is MockFoodItem => Boolean(x)
      ),
    []
  );

  const filteredResults = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return MOCK_FOOD_CATALOG.filter((f) => f.name.includes(q)).slice(0, 20);
  }, [query]);

  const handleSelect = (food: MockFoodItem) => {
    Keyboard.dismiss();
    setQuery("");
    onSelect(food);
  };

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <View style={styles.headerBar}>
          <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={8}>
            <Text fontVariant="bold" fontSize={20} style={styles.closeLabel}>
              ×
            </Text>
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text fontVariant="bold" fontSize={16} style={styles.headerTitle}>
              הוסף מאכל
            </Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchIconRight}>
            <SearchIcon size={16} color={DIET_V2_MUTED} />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="חפש מאכלים, מותגים, טעמים..."
            placeholderTextColor={DIET_V2_MUTED}
            style={styles.searchInput}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8} style={styles.searchClear}>
              <Text fontSize={16} style={styles.searchClearLabel}>
                ×
              </Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {query.trim().length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleWrap}>
                  <Text fontVariant="bold" fontSize={15} style={styles.sectionTitle}>
                    תוצאות חיפוש
                  </Text>
                </View>
              </View>
              <View style={styles.rowsWrap}>
                {filteredResults.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <Text fontSize={13} style={styles.emptyText}>
                      לא נמצאו תוצאות
                    </Text>
                  </View>
                ) : (
                  filteredResults.map((food) => (
                    <FoodRow key={food.id} food={food} onSelect={handleSelect} />
                  ))
                )}
              </View>
            </View>
          ) : (
            <>
              {recent.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleWrap}>
                      <ClockIcon size={16} color={DIET_V2_MUTED} />
                      <Text fontVariant="bold" fontSize={15} style={styles.sectionTitle}>
                        נוספו לאחרונה
                      </Text>
                    </View>
                  </View>
                  <View style={styles.rowsWrap}>
                    {recent.map((food) => (
                      <FoodRow key={`recent-${food.id}`} food={food} onSelect={handleSelect} />
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleWrap}>
                    <FlameIcon size={16} color={DIET_V2_GREEN} />
                    <Text fontVariant="bold" fontSize={15} style={styles.sectionTitle}>
                      פופולרי
                    </Text>
                  </View>
                </View>
                <View style={styles.rowsWrap}>
                  {popular.map((food) => (
                    <FoodRow key={`pop-${food.id}`} food={food} onSelect={handleSelect} />
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
        <FoodQuantityModal
          food={pendingFood}
          defaultMealId={defaultMealId}
          onCancel={onQuantityCancel}
          onConfirm={onQuantityConfirm}
          mealTiles={mealTiles}
          onAddMeal={onAddMeal}
        />
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
    justifyContent: "space-between",
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
  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: DIET_V2_DARK,
  },
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 8,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIconRight: {
    width: 20,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontFamily: "Assistant-Regular",
    fontSize: 14,
    color: DIET_V2_DARK,
    textAlign: "right",
    padding: 0,
  },
  searchClear: {
    width: 22,
    alignItems: "center",
  },
  searchClearLabel: {
    color: DIET_V2_MUTED,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  sectionTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  rowsWrap: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DIET_V2_MINT,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnLabel: {
    color: DIET_V2_GREEN,
  },
  rowTextWrap: {
    flex: 1,
    alignItems: "flex-start",
  },
  rowName: {
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  rowMeta: {
    color: DIET_V2_MUTED,
    textAlign: "right",
    marginTop: 2,
  },
  rowServing: {
    color: DIET_V2_MUTED,
    textAlign: "right",
    marginTop: 2,
    opacity: 0.7,
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    color: DIET_V2_MUTED,
  },
});

export default FoodPickerModal;
