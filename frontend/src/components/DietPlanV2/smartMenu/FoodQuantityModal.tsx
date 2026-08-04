import { FC, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "@/components/ui/Text";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { selectionHaptic } from "@/utils/haptics";
import { FoodUnit, GRAMS_PER_SPOON, MockFoodItem } from "../mockFoodCatalog";
import {
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
} from "../dietV2Icons";
import { MealTile } from "./mealTiles";

interface FoodQuantityModalProps {
  food: MockFoodItem | null;
  defaultMealId: string;
  onCancel: () => void;
  onConfirm: (quantity: number, mealId: string) => void;
  mealTiles: MealTile[];
  onAddMeal: () => string;
}

interface UnitConfig {
  id: FoodUnit;
  label: string;
  step: number;
  min: number;
  max: number;
}

const UNIT_CONFIGS: Record<FoodUnit, UnitConfig> = {
  unit: { id: "unit", label: "יחידה", step: 0.5, min: 0.25, max: 20 },
  gram: { id: "gram", label: "גרם", step: 10, min: 5, max: 1000 },
  spoon: { id: "spoon", label: "כף", step: 0.5, min: 0.25, max: 30 },
};

const defaultValueFor = (unit: FoodUnit, food: MockFoodItem): number => {
  if (unit === "gram") return food.gramsPerServing;
  return 1;
};

const clampQuantity = (raw: number, unit: FoodUnit): number => {
  const cfg = UNIT_CONFIGS[unit];
  if (!Number.isFinite(raw)) return 1;
  return Math.max(cfg.min, Math.min(cfg.max, raw));
};

const toGrams = (unit: FoodUnit, quantity: number, food: MockFoodItem): number => {
  if (unit === "gram") return quantity;
  if (unit === "spoon") return quantity * GRAMS_PER_SPOON;
  return quantity * food.gramsPerServing;
};

const macroFactor = (unit: FoodUnit, quantity: number, food: MockFoodItem): number => {
  const grams = toGrams(unit, quantity, food);
  if (food.gramsPerServing <= 0) return 0;
  return grams / food.gramsPerServing;
};

const FoodQuantityModal: FC<FoodQuantityModalProps> = ({
  food,
  defaultMealId,
  onCancel,
  onConfirm,
  mealTiles,
  onAddMeal,
}) => {
  const [unit, setUnit] = useState<FoodUnit>("unit");
  const [quantity, setQuantity] = useState<number>(1);
  const [mealId, setMealId] = useState<string>(defaultMealId);
  const [rawText, setRawText] = useState<string>("1");

  useEffect(() => {
    if (food) {
      const initUnit = food.availableUnits[0] ?? "unit";
      const initVal = defaultValueFor(initUnit, food);
      setUnit(initUnit);
      setQuantity(initVal);
      setRawText(String(initVal));
      setMealId(defaultMealId);
    }
  }, [food, defaultMealId]);

  const activeUnitCfg = UNIT_CONFIGS[unit];

  const handleTextChange = (text: string) => {
    setRawText(text);
    const parsed = parseFloat(text.replace(",", "."));
    if (Number.isFinite(parsed)) {
      setQuantity(clampQuantity(parsed, unit));
    }
  };

  const bump = (delta: number) => {
    selectionHaptic();
    const next = clampQuantity(quantity + delta, unit);
    setQuantity(next);
    setRawText(String(next));
  };

  const pickUnit = (next: FoodUnit) => {
    if (!food) return;
    selectionHaptic();
    const val = defaultValueFor(next, food);
    setUnit(next);
    setQuantity(val);
    setRawText(String(val));
  };

  const handleConfirm = () => {
    if (!food) return;
    selectionHaptic();
    onConfirm(macroFactor(unit, quantity, food), mealId);
  };

  if (!food) return null;

  const factor = macroFactor(unit, quantity, food);
  const grams = toGrams(unit, quantity, food);
  const preview = {
    protein: Math.round(food.macros.protein * factor),
    carbs: Math.round(food.macros.carbs * factor),
    fat: Math.round(food.macros.fat * factor),
    calories: Math.round(food.macros.calories * factor),
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.avoider}
          pointerEvents="box-none"
        >
          <Pressable style={styles.sheet} onPress={Keyboard.dismiss}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetInner}
            >
              <View style={styles.headerWrap}>
                <Text fontVariant="bold" fontSize={17} style={styles.title}>
                  {food.name}
                </Text>
                <Text fontSize={12} style={styles.subtitle}>
                  {`מנה: ${food.servingLabel} · ${Math.round(food.macros.calories)} קק"ל`}
                </Text>
              </View>

              <View style={styles.section}>
                <View style={styles.headerWrap}>
                  <Text fontVariant="semibold" fontSize={14} style={styles.sectionTitle}>
                    יחידת מדידה
                  </Text>
                </View>
                <View style={styles.unitsRow}>
                  {food.availableUnits.map((uid) => {
                    const cfg = UNIT_CONFIGS[uid];
                    const selected = cfg.id === unit;
                    return (
                      <Pressable
                        key={cfg.id}
                        onPress={() => pickUnit(cfg.id)}
                        style={[styles.unitChip, selected && styles.unitChipSelected]}
                      >
                        <Text
                          fontVariant={selected ? "bold" : "medium"}
                          fontSize={13}
                          style={selected ? styles.unitLabelSelected : styles.unitLabel}
                        >
                          {cfg.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.headerWrap}>
                  <Text fontVariant="semibold" fontSize={14} style={styles.sectionTitle}>
                    {`כמה ${activeUnitCfg.label}?`}
                  </Text>
                </View>
                <View style={styles.quantityRow}>
                  <Pressable onPress={() => bump(-activeUnitCfg.step)} style={styles.quantityBtn}>
                    <Text fontVariant="bold" fontSize={20} style={styles.quantityBtnLabel}>
                      −
                    </Text>
                  </Pressable>
                  <TextInput
                    value={rawText}
                    onChangeText={handleTextChange}
                    keyboardType="decimal-pad"
                    style={styles.quantityInput}
                  />
                  <Pressable onPress={() => bump(activeUnitCfg.step)} style={styles.quantityBtn}>
                    <Text fontVariant="bold" fontSize={20} style={styles.quantityBtnLabel}>
                      +
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.headerWrap}>
                  <Text fontVariant="semibold" fontSize={14} style={styles.sectionTitle}>
                    שיוך לארוחה
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mealsRow}
                >
                  {mealTiles.map((tile) => {
                    const selected = tile.id === mealId;
                    return (
                      <Pressable
                        key={tile.id}
                        onPress={() => {
                          selectionHaptic();
                          setMealId(tile.id);
                        }}
                        style={[styles.mealTile, selected && styles.mealTileSelected]}
                      >
                        <tile.Icon size={18} color={DIET_V2_GREEN} />
                        <Text fontVariant="medium" fontSize={11} style={styles.mealLabel}>
                          {tile.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                  <Pressable
                    onPress={() => {
                      selectionHaptic();
                      const id = onAddMeal();
                      setMealId(id);
                    }}
                    style={styles.addMealTile}
                  >
                    <Text fontVariant="bold" fontSize={22} style={styles.addMealPlus}>
                      +
                    </Text>
                    <Text fontVariant="medium" fontSize={11} style={styles.addMealLabel}>
                      הוסף ארוחה
                    </Text>
                  </Pressable>
                </ScrollView>
              </View>

              <View style={styles.previewBox}>
                <View style={styles.previewInner}>
                  <Text fontSize={12} style={styles.previewLabel}>
                    {`סה"כ: ${Math.round(grams)} גרם · ${preview.calories} קק"ל · ${preview.protein} ח / ${preview.carbs} פ / ${preview.fat} ש`}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Pressable style={styles.cancelBtn} onPress={onCancel}>
                  <Text fontVariant="semibold" fontSize={14} style={styles.cancelLabel}>
                    ביטול
                  </Text>
                </Pressable>
                <View style={styles.confirmWrap}>
                  <PrimaryButton block onPress={handleConfirm}>
                    הוסף
                  </PrimaryButton>
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    elevation: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 42, 34, 0.4)",
    justifyContent: "center",
  },
  avoider: {
    justifyContent: "center",
    paddingHorizontal: 20,
    maxHeight: "100%",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    maxHeight: "100%",
  },
  sheetInner: {
    padding: 20,
    gap: 14,
  },
  headerWrap: {
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  title: {
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  subtitle: {
    color: DIET_V2_MUTED,
    textAlign: "right",
    marginTop: 2,
  },
  section: {
    gap: 8,
    alignSelf: "stretch",
  },
  sectionTitle: {
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  unitsRow: {
    flexDirection: "row",
    gap: 8,
  },
  unitChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  unitChipSelected: {
    borderWidth: 2,
    borderColor: DIET_V2_GREEN,
    backgroundColor: DIET_V2_MINT,
  },
  unitLabel: {
    color: DIET_V2_MUTED,
  },
  unitLabelSelected: {
    color: DIET_V2_GREEN,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  quantityBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAF9",
  },
  quantityBtnLabel: {
    color: DIET_V2_GREEN,
  },
  quantityInput: {
    minWidth: 70,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    paddingHorizontal: 12,
    textAlign: "center",
    fontFamily: "Assistant-Bold",
    fontSize: 18,
    color: DIET_V2_DARK,
  },
  mealsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 2,
  },
  mealTile: {
    width: 78,
    height: 78,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 4,
  },
  mealTileSelected: {
    borderWidth: 2,
    borderColor: DIET_V2_GREEN,
  },
  mealLabel: {
    color: DIET_V2_DARK,
    textAlign: "center",
  },
  addMealTile: {
    width: 78,
    height: 78,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  addMealPlus: {
    color: DIET_V2_GREEN,
  },
  addMealLabel: {
    color: "#166534",
    textAlign: "center",
  },
  previewBox: {
    backgroundColor: DIET_V2_MINT,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "stretch",
  },
  previewInner: {
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  previewLabel: {
    color: DIET_V2_GREEN,
    textAlign: "right",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
  },
  cancelLabel: {
    color: DIET_V2_DARK,
  },
  confirmWrap: {
    flex: 1,
  },
});

export default FoodQuantityModal;
