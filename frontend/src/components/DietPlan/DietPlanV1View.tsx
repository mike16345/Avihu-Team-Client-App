import { View } from "react-native";
import { useDailyDietReset } from "@/hooks/useDailyDietReset";
import useStyles from "@/styles/useGlobalStyles";
import DietPlanContentTabs from "./DietPlanContentTabs";
import DietPlanScreenHeader from "./DietPlanScreenHeader";

const DietPlanV1View = () => {
  const { spacing } = useStyles();
  useDailyDietReset();

  return (
    <View style={spacing.gap34}>
      <DietPlanScreenHeader />
      <DietPlanContentTabs />
    </View>
  );
};

export default DietPlanV1View;
