import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import SecondaryButton from "../ui/buttons/SecondaryButton";
import DailyCalorieIntake from "./DailyCalorieIntake";
import { Text } from "../ui/Text";

const DietPlanScreenHeader = () => {
  const { layout, spacing } = useStyles();

  return (
    <View style={[layout.flexRow, spacing.gapLg, layout.itemsCenter]}>
      <View style={[layout.flexRow, layout.widthFull, { flex: 2 }]}>
        <DailyCalorieIntake />
      </View>
      <View style={[layout.flexRow, layout.center, { flex: 1 }]}>
        <SecondaryButton rightIcon="info">
          <Text fontVariant="semibold">דגשים</Text>
        </SecondaryButton>
      </View>
    </View>
  );
};

export default DietPlanScreenHeader;
