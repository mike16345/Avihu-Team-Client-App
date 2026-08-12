import { useMemo } from "react";
import { View } from "react-native";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import useStyles from "@/styles/useGlobalStyles";
import { computeDietPlanV2Totals } from "./dietPlanV2Utils";
import DietPlanV2Header from "./DietPlanV2Header";
import DietPlanV2Tabs from "./DietPlanV2Tabs";

interface DietPlanV2ViewProps {
  plan: IDietPlanV2;
}

const DietPlanV2View = ({ plan }: DietPlanV2ViewProps) => {
  const { spacing } = useStyles();
  const totals = useMemo(() => computeDietPlanV2Totals(plan), [plan]);

  return (
    <View style={spacing.gap34}>
      <DietPlanV2Header totals={totals} />
      <DietPlanV2Tabs plan={plan} />
    </View>
  );
};

export default DietPlanV2View;
