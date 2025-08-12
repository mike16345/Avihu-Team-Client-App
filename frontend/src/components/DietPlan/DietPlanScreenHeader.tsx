import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import SecondaryButton from "../ui/buttons/SecondaryButton";
import DailyCalorieIntake from "./DailyCalorieIntake";

const DietPlanScreenHeader = () => {
  const { layout, spacing } = useStyles();

  return (
    <View style={[layout.flexRow, spacing.gapLg, layout.itemsCenter, spacing.pdDefault]}>
      <View style={[layout.flexRow, layout.widthFull, { flex: 1 }]}>
        <DailyCalorieIntake />
      </View>
      <View style={[layout.flexRow, layout.center, { flex: 0 }]}>
        <SecondaryButton rightIcon="info">דגשים</SecondaryButton>
      </View>
    </View>
  );
};

export default DietPlanScreenHeader;
