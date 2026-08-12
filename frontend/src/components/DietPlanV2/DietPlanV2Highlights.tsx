import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { DIET_V2_MUTED } from "./dietV2Icons";

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
      <View style={[spacing.pdHorizontalMd, styles.empty]}>
        <Text style={styles.emptyText}>אין דגשים</Text>
      </View>
    );
  }

  return (
    <View style={[spacing.pdHorizontalMd, styles.list]}>
      {lines.map((line, index) => (
        <Text key={`${index}-${line}`} fontSize={15} style={styles.line}>
          {line}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  line: {
    color: "#0B2A22",
    lineHeight: 23,
    textAlign: "right",
  },
  empty: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: DIET_V2_MUTED,
    textAlign: "center",
  },
});

export default DietPlanV2Highlights;
