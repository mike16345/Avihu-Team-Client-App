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
import {
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
} from "../dietV2Icons";
import { MealTile } from "./mealTiles";

interface NoteReminderModalProps {
  visible: boolean;
  defaultMealId: string;
  onCancel: () => void;
  onConfirm: (text: string, mealId: string) => void;
  mealTiles: MealTile[];
  onAddMeal: () => string;
}

const NoteReminderModal: FC<NoteReminderModalProps> = ({
  visible,
  defaultMealId,
  onCancel,
  onConfirm,
  mealTiles,
  onAddMeal,
}) => {
  const [text, setText] = useState("");
  const [mealId, setMealId] = useState(defaultMealId);

  const reset = () => {
    setText("");
    setMealId(defaultMealId);
  };

  const canSubmit = text.trim().length > 0;

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirm = () => {
    if (!canSubmit) return;
    selectionHaptic();
    onConfirm(text.trim(), mealId);
    reset();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
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
                  תזכורת לזכרון
                </Text>
                <Text fontSize={12} style={styles.subtitle}>
                  הערה חופשית שלא נכללת בחישוב הקלוריות
                </Text>
              </View>

              <View style={styles.field}>
                <View style={styles.labelWrap}>
                  <Text fontSize={12} fontVariant="semibold" style={styles.label}>
                    מה אכלת?
                  </Text>
                </View>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="לדוגמה: חצי קרואסון של אמא"
                  placeholderTextColor={DIET_V2_MUTED}
                  style={styles.textInput}
                  multiline
                />
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
                    שמור לזכרון
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
    minHeight: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#BBF7D0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Assistant-Regular",
    fontSize: 14,
    color: DIET_V2_DARK,
    textAlign: "right",
    backgroundColor: "#F0FDF4",
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

export default NoteReminderModal;
