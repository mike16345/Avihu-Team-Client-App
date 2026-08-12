import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { DIET_V2_CARD_BORDER, DIET_V2_DARK, DIET_V2_MUTED } from "./dietV2Icons";

interface DietPlanV2HighlightsProps {
  highlights: string;
}

const DietPlanV2Highlights = ({ highlights }: DietPlanV2HighlightsProps) => {
  const { spacing } = useStyles();
  const displayText = highlights.trim().length > 0 ? highlights : "אין דגשים";

  return (
    <View style={spacing.pdHorizontalMd}>
      <View style={styles.card}>
        <Text
          fontSize={16}
          style={[styles.text, highlights.trim().length === 0 && styles.emptyText]}
        >
          {displayText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    borderRadius: 18,
    padding: 20,
  },
  text: {
    color: DIET_V2_DARK,
    lineHeight: 25,
    textAlign: "right",
  },
  emptyText: {
    color: DIET_V2_MUTED,
    textAlign: "center",
  },
});

export default DietPlanV2Highlights;
