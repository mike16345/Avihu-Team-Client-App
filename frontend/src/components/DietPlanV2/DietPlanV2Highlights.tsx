import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { DIET_V2_CARD_BORDER, DIET_V2_DARK, DIET_V2_GREEN, DIET_V2_MUTED } from "./dietV2Icons";

interface DietPlanV2HighlightsProps {
  highlights: string;
}

const DietPlanV2Highlights = ({ highlights }: DietPlanV2HighlightsProps) => {
  const { spacing } = useStyles();
  const lines = highlights
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return (
      <View style={spacing.pdHorizontalMd}>
        <View style={[styles.card, styles.empty]}>
          <Text fontVariant="semibold" style={styles.emptyText}>
            אין דגשים כרגע
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={spacing.pdHorizontalMd}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.accent} />
          <Text fontVariant="bold" fontSize={16} style={styles.title}>
            דגשים מהמאמן
          </Text>
        </View>
        {lines.map((line, index) => (
          <View key={`${index}-${line}`} style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text fontSize={15} style={styles.line}>
              {line}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 16,
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    paddingBottom: 2,
  },
  accent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: DIET_V2_GREEN,
  },
  title: {
    flex: 1,
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  line: {
    flex: 1,
    color: DIET_V2_DARK,
    lineHeight: 24,
    textAlign: "right",
  },
  tipRow: { width: "100%", flexDirection: "row", alignItems: "flex-start", gap: 10 },
  tipDot: {
    width: 7,
    height: 7,
    marginTop: 8,
    borderRadius: 4,
    backgroundColor: DIET_V2_GREEN,
  },
  empty: {
    minHeight: 104,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    width: "100%",
    color: DIET_V2_MUTED,
    textAlign: "center",
  },
});

export default DietPlanV2Highlights;
