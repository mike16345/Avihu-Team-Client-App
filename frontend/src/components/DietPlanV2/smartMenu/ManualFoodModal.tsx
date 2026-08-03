import { FC, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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
import { MockFoodItem } from "../mockFoodCatalog";
import {
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
} from "../dietV2Icons";
import { MealTile } from "./mealTiles";

interface ManualFoodModalProps {
  visible: boolean;
  defaultMealId: string;
  onCancel: () => void;
  onConfirm: (food: MockFoodItem, mealId: string) => void;
  mealTiles: MealTile[];
  onAddMeal: () => string;
}

const parseNumber = (raw: string): number => {
  const v = parseFloat(raw.replace(",", "."));
  return Number.isFinite(v) && v >= 0 ? v : 0;
};

const ManualFoodModal: FC<ManualFoodModalProps> = ({
  visible,
  defaultMealId,
  onCancel,
  onConfirm,
  mealTiles,
  onAddMeal,
}) => {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [mealId, setMealId] = useState(defaultMealId);

  const reset = () => {
    setName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setMealId(defaultMealId);
  };

  const canSubmit = name.trim().length > 0 && parseNumber(calories) > 0;

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirm = () => {
    if (!canSubmit) return;
    selectionHaptic();
    const food: MockFoodItem = {
      id: `manual-${Date.now()}`,
      name: name.trim(),
      servingLabel: "מנה ידנית",
      gramsPerServing: 100,
      availableUnits: ["unit"],
      macros: {
        calories: parseNumber(calories),
        protein: parseNumber(protein),
        carbs: parseNumber(carbs),
        fat: parseNumber(fat),
      },
    };
    onConfirm(food, mealId);
    reset();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.backdrop} onPress={handleCancel}>
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
                  הוספת מאכל ידני
                </Text>
                <Text fontSize={12} style={styles.subtitle}>
                  רשום את שם המאכל והערכים התזונתיים
                </Text>
              </View>

              <View style={styles.field}>
                <View style={styles.labelWrap}>
                  <Text fontSize={12} fontVariant="semibold" style={styles.label}>
                    שם המאכל
                  </Text>
                </View>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="לדוגמה: שוקולד ביתי"
                  placeholderTextColor={DIET_V2_MUTED}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.field}>
                <View style={styles.labelWrap}>
                  <Text fontSize={12} fontVariant="semibold" style={styles.label}>
                    קלוריות
                  </Text>
                </View>
                <TextInput
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="0"
                  placeholderTextColor={DIET_V2_MUTED}
                  keyboardType="decimal-pad"
                  style={styles.textInput}
                />
              </View>

              <View style={styles.macrosRow}>
                <MacroField label="חלבון" value={protein} onChange={setProtein} />
                <MacroField label="פחמימה" value={carbs} onChange={setCarbs} />
                <MacroField label="שומן" value={fat} onChange={setFat} />
              </View>

              <View style={styles.section}>
                <View style={styles.labelWrap}>
                  <Text fontSize={12} fontVariant="semibold" style={styles.label}>
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

              <View style={styles.actionsRow}>
                <Pressable style={styles.cancelBtn} onPress={handleCancel}>
                  <Text fontVariant="semibold" fontSize={14} style={styles.cancelLabel}>
                    ביטול
                  </Text>
                </Pressable>
                <View style={styles.confirmWrap}>
                  <PrimaryButton block onPress={handleConfirm} disabled={!canSubmit}>
                    הוסף מאכל
                  </PrimaryButton>
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const MacroField: FC<{ label: string; value: string; onChange: (v: string) => void }> = ({
  label,
  value,
  onChange,
}) => (
  <View style={styles.macroField}>
    <Text fontSize={11} style={styles.macroLabel}>
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="0"
      placeholderTextColor={DIET_V2_MUTED}
      keyboardType="decimal-pad"
      style={styles.macroInput}
    />
    <Text fontSize={10} style={styles.macroUnit}>
      גרם
    </Text>
  </View>
);

const styles = StyleSheet.create({
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
  field: {
    gap: 6,
    alignSelf: "stretch",
  },
  labelWrap: {
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  label: {
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  textInput: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    paddingHorizontal: 12,
    fontFamily: "Assistant-Regular",
    fontSize: 14,
    color: DIET_V2_DARK,
    textAlign: "right",
    backgroundColor: "#F8FAF9",
  },
  macrosRow: {
    flexDirection: "row",
    gap: 8,
  },
  macroField: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#F8FAF9",
  },
  macroLabel: {
    color: DIET_V2_MUTED,
  },
  macroInput: {
    height: 26,
    minWidth: 50,
    fontFamily: "Assistant-Bold",
    fontSize: 15,
    color: DIET_V2_DARK,
    textAlign: "center",
    padding: 0,
  },
  macroUnit: {
    color: DIET_V2_MUTED,
  },
  section: {
    gap: 8,
    alignSelf: "stretch",
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
    backgroundColor: DIET_V2_MINT,
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

export default ManualFoodModal;
