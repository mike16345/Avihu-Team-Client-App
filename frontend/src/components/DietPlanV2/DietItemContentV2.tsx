import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { DietV2Category, DietV2Option, formatUnitLabel } from "@/interfaces/DietPlanV2";
import { selectionHaptic } from "@/utils/haptics";
import { CATEGORY_LABELS } from "./dietPlanV2ClientUtils";

interface DietItemContentV2Props {
  category: DietV2Category;
  consumed?: boolean;
  onToggle?: () => void;
}

const formatOption = (option: DietV2Option): string => {
  const unit = formatUnitLabel(option.unit, option.quantity);
  return `${option.quantity} ${unit} ${option.foodName}`;
};

const DietItemContentV2: React.FC<DietItemContentV2Props> = ({ category, consumed, onToggle }) => {
  const label = CATEGORY_LABELS[category.kind];
  if (!category.options.length) return null;

  const line = category.options.map(formatOption).join(" | ");

  const handlePress = () => {
    if (!onToggle) return;
    selectionHaptic();
    onToggle();
  };

  return (
    <Pressable onPress={handlePress} style={[styles.container, consumed && styles.consumed]}>
      <View style={styles.headerRow}>
        <Text fontVariant="bold" fontSize={15} style={styles.header}>
          {label}
        </Text>
        {consumed && (
          <View style={styles.checkBadge}>
            <Text fontVariant="bold" fontSize={11} style={styles.checkLabel}>
              ✓ נאכל
            </Text>
          </View>
        )}
      </View>
      <View style={styles.rowWrap}>
        <Text fontSize={15} style={[styles.body, consumed && styles.bodyConsumed]}>
          {line}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
    alignSelf: "stretch",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(15, 94, 59, 0.10)",
  },
  consumed: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "space-between",
    gap: 8,
  },
  rowWrap: {
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  header: {
    color: "#0B2A22",
    textAlign: "right",
  },
  body: {
    color: "#4B5563",
    textAlign: "right",
    lineHeight: 22,
  },
  bodyConsumed: {
    color: "#4B7A62",
    textDecorationLine: "line-through",
    textDecorationColor: "#86EFAC",
  },
  checkBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  checkLabel: {
    color: "#166534",
  },
});

export default DietItemContentV2;
