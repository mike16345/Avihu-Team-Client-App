import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import DailyCalorieIntakeStyle1 from "./DailyCalorieIntakeStyle1";

const DietPlanScreenHeader = () => {
  const { spacing } = useStyles();

  return (
    <View style={[spacing.pdHorizontalMd]}>
      <DailyCalorieIntakeStyle1 />
    </View>
  );
};

export default DietPlanScreenHeader;
