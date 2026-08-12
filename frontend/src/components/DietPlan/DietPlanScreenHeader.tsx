import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import DietPlanV1Summary from "./DietPlanV1Summary";

const DietPlanScreenHeader = () => {
  const { spacing } = useStyles();

  return (
    <View style={[spacing.pdHorizontalMd]}>
      <DietPlanV1Summary />
    </View>
  );
};

export default DietPlanScreenHeader;
