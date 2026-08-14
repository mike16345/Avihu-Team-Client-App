import { Pressable, StyleSheet, View } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import type { DietV2PlanItem } from "@/interfaces/IDietPlanV2";
import { selectionHaptic } from "@/utils/haptics";
import { formatDietV2Items } from "./dietPlanV2Utils";

interface DietPlanV2AddOnsProps {
  addOns: DietV2PlanItem[];
  consumed: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

const DietPlanV2AddOns = ({ addOns, consumed, disabled, onToggle }: DietPlanV2AddOnsProps) => {
  const description = formatDietV2Items(addOns);
  if (!description) return null;

  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        selectionHaptic();
        onToggle();
      }}
      style={({ pressed }) => [
        styles.container,
        consumed && styles.consumed,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={styles.headerRow}>
        <Text fontVariant="bold" fontSize={15} style={styles.heading}>
          תוספות
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
      <Text fontSize={15} style={[styles.description, consumed && styles.descriptionConsumed]}>
        {description}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    gap: 4,
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
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.995 }],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  heading: {
    color: "#0B2A22",
  },
  description: {
    color: "#4B5563",
    lineHeight: 22,
  },
  descriptionConsumed: {
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

export default DietPlanV2AddOns;
