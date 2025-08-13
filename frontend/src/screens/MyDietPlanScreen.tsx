import DietPlanContentTabs from "@/components/DietPlan/DietPlanContentTabs";
import DietPlanScreenHeader from "@/components/DietPlan/DietPlanScreenHeader";
import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";

const MyDietPlanScreen = () => {
  const { spacing } = useStyles();

  return (
    <View style={[spacing.pdMd, spacing.gapLg]}>
      <DietPlanScreenHeader />
      <DietPlanContentTabs />
    </View>
  );
};

export default MyDietPlanScreen;
