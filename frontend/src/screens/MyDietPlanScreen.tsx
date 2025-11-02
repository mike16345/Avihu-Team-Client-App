import DietPlanContentTabs from "@/components/DietPlan/DietPlanContentTabs";
import DietPlanScreenHeader from "@/components/DietPlan/DietPlanScreenHeader";
import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";

const MyDietPlanScreen = () => {
  const { spacing } = useStyles();

  return (
    <View style={[spacing.gap34, spacing.pdStatusBar]}>
      <DietPlanScreenHeader />
      <DietPlanContentTabs />
    </View>
  );
};

export default MyDietPlanScreen;
