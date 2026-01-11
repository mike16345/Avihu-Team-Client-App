import DietPlanContentTabs from "@/components/DietPlan/DietPlanContentTabs";
import DietPlanScreenHeader from "@/components/DietPlan/DietPlanScreenHeader";
import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";

const MyDietPlanScreen = () => {
  const { spacing, layout } = useStyles();

  return (
    <View style={[spacing.gap34, spacing.pdStatusBar, spacing.pdBottomBar, layout.flex1]}>
      <DietPlanScreenHeader />
      <DietPlanContentTabs />
    </View>
  );
};

export default MyDietPlanScreen;
