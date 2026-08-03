import { ScrollView, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import HtmlBlock from "../ui/HTMLBlock";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";

const HighlightsTab = () => {
  const { spacing, layout } = useStyles();
  const { data } = useDietPlanQuery();
  const tips = data?.customInstructions || [];

  if (tips.length === 0) {
    return (
      <View style={[spacing.pdHorizontalMd, layout.center, { paddingVertical: 40 }]}>
        <Text>אין דגשים</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[spacing.pdHorizontalMd, spacing.pdVerticalMd]}
    >
      {tips.map((tip: string, i: number) => (
        <HtmlBlock key={i} source={{ html: tip }} />
      ))}
    </ScrollView>
  );
};

export default HighlightsTab;
