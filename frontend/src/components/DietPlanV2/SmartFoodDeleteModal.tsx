import { semanticColors } from "@/themes/semanticColors";
import { Pressable, StyleSheet, View } from "react-native";
import Icon from "@/components/Icon/Icon";
import { Text } from "@/components/ui/Text";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { CustomModal } from "@/components/ui/modals/Modal";
import { errorNotificationHaptic, selectionHaptic } from "@/utils/haptics";
import type { SmartFoodEntry } from "./foodCatalog";
import { DIET_V2_CARD_BORDER, DIET_V2_DARK, DIET_V2_MUTED } from "./dietV2Icons";

interface SmartFoodDeleteModalProps {
  entry: SmartFoodEntry | null;
  onDismiss: () => void;
  onConfirm: (entry: SmartFoodEntry) => void;
}

const SmartFoodDeleteModal = ({ entry, onDismiss, onConfirm }: SmartFoodDeleteModalProps) => (
  <CustomModal transparent visible={entry !== null} onDismiss={onDismiss} style={styles.backdrop}>
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Icon name="trash" width={24} height={24} color={semanticColors.diet.dangerBorder} />
        </View>
        <View style={styles.copy}>
          <Text fontVariant="bold" fontSize={20} style={styles.title}>
            להסיר מהרישומים של היום?
          </Text>
          <Text selectable fontSize={14} style={styles.description}>
            {entry ? `הפעולה תסיר את \"${entry.name}\" ותעדכן מיד את הסיכום היומי.` : ""}
          </Text>
        </View>
        <View style={styles.actions}>
          <PrimaryButton
            block
            mode="light"
            style={styles.action}
            onPress={() => {
              selectionHaptic();
              onDismiss();
            }}
          >
            ביטול
          </PrimaryButton>
          <Pressable
            disabled={!entry}
            style={[styles.action, styles.deleteButton]}
            onPress={() => {
              if (!entry) return;
              void errorNotificationHaptic().catch(() => undefined);
              onConfirm(entry);
            }}
          >
            <Text fontVariant="bold" fontSize={16} style={styles.deleteLabel}>
              הסר מוצר
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  </CustomModal>
);

const styles = StyleSheet.create({
  backdrop: { paddingHorizontal: 20, backgroundColor: semanticColors.overlay.modal },
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    width: "100%",
    maxWidth: 370,
    padding: 20,
    gap: 18,
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: semanticColors.app.surfaceRaised,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: semanticColors.diet.dangerBackground,
  },
  copy: { width: "100%", gap: 7 },
  title: { width: "100%", color: DIET_V2_DARK, textAlign: "center" },
  description: {
    width: "100%",
    color: DIET_V2_MUTED,
    lineHeight: 21,
    textAlign: "center",
  },
  actions: { width: "100%", flexDirection: "row", gap: 10 },
  action: { flex: 1 },
  deleteButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: semanticColors.diet.dangerBorder,
  },
  deleteLabel: { color: semanticColors.app.surfaceRaised },
});

export default SmartFoodDeleteModal;
