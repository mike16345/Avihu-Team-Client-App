import { semanticColors } from "@/themes/semanticColors";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import type { FoodCatalogProduct } from "@/interfaces/IFoodCatalog";
import useStyles from "@/styles/useGlobalStyles";
import { selectionHaptic } from "@/utils/haptics";
import {
  ChevronDownIcon,
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
} from "./dietV2Icons";

type Serving = NonNullable<FoodCatalogProduct["servings"]>[number];

interface FoodCatalogServingSelectProps {
  servings: Serving[];
  selectedId: string;
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (servingId: string) => void;
}

const FoodCatalogServingSelect = ({
  servings,
  selectedId,
  visible,
  onOpen,
  onClose,
  onSelect,
}: FoodCatalogServingSelectProps) => {
  const { layout } = useStyles();
  const selected = servings.find((serving) => serving.id === selectedId) ?? servings[0];

  if (!selected) return null;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="בחירת סוג מנה"
        onPress={() => {
          selectionHaptic();
          onOpen();
        }}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <View
          style={[
            layout.widthFull,
            layout.flexRow,
            layout.itemsCenter,
            layout.justifyBetween,
            styles.triggerContent,
          ]}
        >
          <Text fontVariant="semibold" fontSize={14} style={styles.triggerText}>
            {selected.description}
          </Text>
          <View style={visible ? styles.chevronOpen : undefined}>
            <ChevronDownIcon size={18} color={DIET_V2_GREEN} />
          </View>
        </View>
      </Pressable>

      <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={[layout.widthFull, styles.sheetContent]}>
              <View style={styles.handle} />
              <Text fontVariant="bold" fontSize={17} style={styles.title}>
                בחירת סוג מנה
              </Text>
              <View style={styles.options}>
                {servings.map((serving) => {
                  const isSelected = serving.id === selected.id;
                  return (
                    <Pressable
                      key={serving.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => {
                        selectionHaptic();
                        onSelect(serving.id);
                        onClose();
                      }}
                      style={({ pressed }) => [
                        styles.option,
                        isSelected && styles.selectedOption,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          layout.widthFull,
                          layout.flexRow,
                          layout.itemsCenter,
                          styles.optionContent,
                        ]}
                      >
                        <View style={[styles.radio, isSelected && styles.selectedRadio]}>
                          {isSelected ? <View style={styles.radioDot} /> : null}
                        </View>
                        <View style={[layout.flex1, layout.itemsStart, styles.optionCopy]}>
                          <Text fontVariant="semibold" fontSize={15} style={styles.optionName}>
                            {serving.description}
                          </Text>
                          <Text fontSize={11} style={styles.optionMeta}>
                            {`${serving.quantity} ${serving.unit}`}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: semanticColors.app.dietServingSurface,
  },
  triggerContent: { minHeight: 44, gap: 8, paddingHorizontal: 12 },
  triggerText: { flex: 1, color: DIET_V2_DARK },
  chevronOpen: { transform: [{ rotate: "180deg" }] },
  pressed: { opacity: 0.72 },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
    backgroundColor: semanticColors.overlay.modalStrong,
  },
  sheet: {
    width: "100%",
    borderRadius: 22,
    backgroundColor: semanticColors.app.surfaceRaised,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
    gap: 13,
  },
  handle: {
    width: 38,
    height: 4,
    alignSelf: "center",
    borderRadius: 2,
    backgroundColor: DIET_V2_CARD_BORDER,
  },
  title: { color: DIET_V2_DARK },
  options: { gap: 7 },
  option: {
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
  },
  optionContent: { minHeight: 58, gap: 11, paddingHorizontal: 13, paddingVertical: 9 },
  selectedOption: {
    borderColor: semanticColors.app.dietServingBorder,
    backgroundColor: DIET_V2_MINT,
  },
  radio: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: DIET_V2_MUTED,
  },
  selectedRadio: { borderColor: DIET_V2_GREEN },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: DIET_V2_GREEN },
  optionCopy: {},
  optionName: { color: DIET_V2_DARK },
  optionMeta: { color: DIET_V2_MUTED, writingDirection: "ltr" },
});

export default FoodCatalogServingSelect;
