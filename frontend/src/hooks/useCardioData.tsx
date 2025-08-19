import Icon from "@/components/Icon/Icon";
import { Text } from "@/components/ui/Text";
import { ISimpleCardioType } from "@/interfaces/Workout";
import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";

export const useCardioData = (cardioPlan?: ISimpleCardioType) => {
  const { colors, fonts, layout, spacing } = useStyles();

  if (!cardioPlan) return [];

  return [
    {
      title: "דקות אירובי בשבוע",
      value: (
        <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
          <Icon name="clock" />
          <Text fontVariant="bold" style={[colors.textPrimary, fonts.lg]}>
            {cardioPlan.minsPerWeek} דקות
          </Text>
        </View>
      ),
    },
    {
      title: "פעמים בשבוע",
      value: (
        <Text fontVariant="bold" style={[colors.textPrimary, fonts.lg]}>
          {cardioPlan.timesPerWeek}
        </Text>
      ),
    },
    {
      title: "דקות לאימון",
      value: (
        <Text fontVariant="bold" style={[colors.textPrimary, fonts.lg]}>
          {cardioPlan.minsPerWorkout}
        </Text>
      ),
    },
  ];
};
