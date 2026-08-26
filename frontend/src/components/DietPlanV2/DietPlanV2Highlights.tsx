import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { DIET_V2_CARD_BORDER, DIET_V2_DARK, DIET_V2_GREEN, DIET_V2_MUTED } from "./dietV2Icons";
import { isHtmlEmpty } from "@/utils/htmlUtils";
import HtmlBlock from "../ui/HTMLBlock";

interface DietPlanV2HighlightsProps {
  highlights: string;
}

const DietPlanV2Highlights = ({ highlights }: DietPlanV2HighlightsProps) => {
  const { spacing } = useStyles();

  if (isHtmlEmpty(highlights)) {
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
        <HtmlBlock source={{ html: highlights }} />
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
    color: DIET_V2_DARK,
  },
  richText: {
    color: DIET_V2_DARK,
    fontFamily: "Assistant-Regular",
    fontSize: 15,
    lineHeight: 24,
    writingDirection: "rtl",
  },
  richParagraph: { marginTop: 0, marginBottom: 8 },
  richListItem: { marginBottom: 5 },
  richLink: { color: DIET_V2_GREEN, textDecorationLine: "underline" },
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
