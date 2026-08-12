import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import useStyles from "@/styles/useGlobalStyles";
import { computeDietPlanV2Totals } from "./dietPlanV2Utils";
import DietPlanV2Header from "./DietPlanV2Header";
import DietPlanV2Tabs from "./DietPlanV2Tabs";
import useDietPlanV2Consumption from "./useDietPlanV2Consumption";

interface DietPlanV2ViewProps {
  plan: IDietPlanV2;
}

const DietPlanV2View = ({ plan }: DietPlanV2ViewProps) => {
  const { spacing } = useStyles();
  const totals = useMemo(() => computeDietPlanV2Totals(plan), [plan]);
  const { completion, consumedTotals, isReady, toggleMeal, toggleRow } =
    useDietPlanV2Consumption(plan);

  return (
    <View style={styles.container}>
      <View style={[spacing.pdHorizontalMd, styles.header]}>
        <DietPlanV2Header totals={totals} consumed={consumedTotals} />
      </View>
      <DietPlanV2Tabs
        plan={plan}
        completion={completion}
        disabled={!isReady}
        onToggleRow={toggleRow}
        onToggleMeal={toggleMeal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    paddingTop: 14,
    paddingBottom: 18,
  },
});

export default DietPlanV2View;
