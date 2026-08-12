import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import type { DietV2Category } from "@/interfaces/IDietPlanV2";
import useStyles from "@/styles/useGlobalStyles";
import { DIET_V2_DARK, DIET_V2_GREEN } from "./dietV2Icons";
import { DIET_V2_CATEGORY_LABELS, formatDietV2CategoryItems } from "./dietPlanV2Utils";

interface DietPlanV2CategoryRowProps {
  category: DietV2Category;
}

const DietPlanV2CategoryRow = ({ category }: DietPlanV2CategoryRowProps) => {
  const { spacing } = useStyles();

  return (
    <View style={spacing.gapSm}>
      <Text fontSize={13} fontVariant="semibold" style={styles.label}>
        {DIET_V2_CATEGORY_LABELS[category.category]}
      </Text>
      <Text fontSize={15} style={styles.items}>
        {formatDietV2CategoryItems(category)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    color: DIET_V2_GREEN,
  },
  items: {
    color: DIET_V2_DARK,
    lineHeight: 22,
    textAlign: "right",
  },
});

export default DietPlanV2CategoryRow;
