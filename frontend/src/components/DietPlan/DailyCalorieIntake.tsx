import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";
import { Text } from "../ui/Text";
import ProgressBar from "../ui/ProgressBar";
import Badge from "../ui/Badge";

const DailyCalorieIntake = () => {
  const { layout, spacing, fonts } = useStyles();

  return (
    <View style={[layout.flexRow, layout.widthFull]}>
      <View style={[layout.widthFull, spacing.gapLg]}>
        <View style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}>
          <Text fontVariant="bold" style={[fonts.xl]}>
            {3000}
          </Text>
          <Text>קלוריות יומיות</Text>
        </View>
        <ProgressBar value={1000} maxValue={3000} />
        <Badge alignStart showDot>
          <Text fontVariant="medium">450 קלוריות חופשיות בנוסף</Text>
        </Badge>
      </View>
    </View>
  );
};

export default DailyCalorieIntake;
