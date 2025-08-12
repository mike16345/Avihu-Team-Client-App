import DietPlanScreenHeader from "@/components/DietPlan/DietPlanScreenHeader";
import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";

const MyDietPlanScreen = () => {
  const { spacing } = useStyles();

  return (
    <View style={[spacing.pdDefault]}>
      <DietPlanScreenHeader />
    </View>
  );
};

export default MyDietPlanScreen;
