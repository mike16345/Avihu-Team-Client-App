import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import type { DietV2PlanItem } from "@/interfaces/IDietPlanV2";
import { formatDietV2Items } from "./dietPlanV2Utils";

interface DietPlanV2AddOnsProps {
  addOns: DietV2PlanItem[];
}

const DietPlanV2AddOns = ({ addOns }: DietPlanV2AddOnsProps) => {
  const description = formatDietV2Items(addOns);
  if (!description) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.dot} />
        <Text fontVariant="bold" fontSize={15} style={styles.heading}>
          תוספות
        </Text>
      </View>
      <Text fontSize={15} style={styles.description}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    gap: 5,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headingRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#64748B",
  },
  heading: {
    color: "#334155",
    textAlign: "right",
  },
  description: {
    color: "#64748B",
    textAlign: "right",
    lineHeight: 22,
  },
});

export default DietPlanV2AddOns;
