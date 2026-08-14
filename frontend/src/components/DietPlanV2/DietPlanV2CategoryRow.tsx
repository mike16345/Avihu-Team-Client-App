import { Pressable, StyleSheet, View } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import type { DietV2Category } from "@/interfaces/IDietPlanV2";
import { selectionHaptic } from "@/utils/haptics";
import { DIET_V2_CATEGORY_LABELS, formatDietV2CategoryItems } from "./dietPlanV2Utils";

interface DietPlanV2CategoryRowProps {
  category: DietV2Category;
  consumed: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

const DietPlanV2CategoryRow = ({
  category,
  consumed,
  disabled,
  onToggle,
}: DietPlanV2CategoryRowProps) => (
  <Pressable
    disabled={disabled}
    onPress={() => {
      selectionHaptic();
      onToggle();
    }}
    style={[styles.container, consumed && styles.consumed]}
  >
    <View style={styles.headerRow}>
      <Text fontVariant="bold" fontSize={15} style={styles.header}>
        {DIET_V2_CATEGORY_LABELS[category.category]}
      </Text>
      {consumed && (
        <Animated.View
          entering={ZoomIn.duration(180).springify().damping(16)}
          exiting={ZoomOut.duration(120)}
          style={styles.checkBadge}
        >
          <Text fontVariant="bold" fontSize={11} style={styles.checkLabel}>
            ✓ נאכל
          </Text>
        </Animated.View>
      )}
    </View>
    <Text fontSize={15} style={[styles.body, consumed && styles.bodyConsumed]}>
      {formatDietV2CategoryItems(category)}
    </Text>
  </Pressable>
);

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
    justifyContent: "space-between",
    gap: 8,
  },
  header: {
    color: "#0B2A22",
  },
  body: {
    color: "#4B5563",
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

export default DietPlanV2CategoryRow;
