import { ScrollView, View, StyleSheet } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import HtmlBlock from "../ui/HTMLBlock";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
import { isHtmlEmpty } from "@/utils/utils";
import { DIET_V2_MUTED } from "../DietPlanV2/dietV2Icons";

const HighlightsTab = () => {
  const { spacing } = useStyles();
  const { data } = useDietPlanQuery();
  const tips = (data?.customInstructions || []).filter((t: string) => !isHtmlEmpty(t));

  return (
    <View style={spacing.pdHorizontalMd}>
      <View style={styles.card}>
        {tips.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text fontSize={14} style={styles.emptyText}>
              אין דגשים
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentInner}
          >
            {tips.map((tip: string, i: number) => (
              <HtmlBlock key={i} source={{ html: tip }} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(15, 94, 59, 0.08)",
    minHeight: 180,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 14,
  },
  contentInner: {
    gap: 8,
  },
  emptyWrap: {
    flex: 1,
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: DIET_V2_MUTED,
  },
});

export default HighlightsTab;
