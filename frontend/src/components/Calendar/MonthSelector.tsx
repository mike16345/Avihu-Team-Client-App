import { TouchableOpacity, View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import Icon from "../Icon/Icon";
import { monthNames } from "@/config/calendarConfig";

interface MonthSelectorProps {
  onCloseMonthSelect: () => void;
  activeMonthIndex: number;
  onMonthSelect: (selectedMonth: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  onCloseMonthSelect,
  activeMonthIndex,
  onMonthSelect,
}) => {
  const { colors, common, layout, spacing, text } = useStyles();

  const isActiveMonth = (index: number) => activeMonthIndex === index;

  return (
    <View
      style={[
        { position: "relative", top: 0, right: 0 },
        layout.flex1,
        colors.backgroundSurface,
        common.rounded,
      ]}
    >
      <View style={[layout.flexRow, layout.justifyBetween, layout.itemsCenter, spacing.pdLg]}>
        <Text fontSize={16}>חודשים</Text>
        <TouchableOpacity onPress={onCloseMonthSelect}>
          <Icon name="close" />
        </TouchableOpacity>
      </View>

      <View style={[layout.flexRow, layout.wrap, layout.center]}>
        {monthNames.map((month: string, i: number) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              onMonthSelect(i);
              onCloseMonthSelect();
            }}
            style={[
              spacing.pdDefault,
              common.rounded,
              { width: 90 },
              isActiveMonth(i) && colors.backgroundPrimary,
            ]}
          >
            <Text
              fontVariant="semibold"
              style={[text.textCenter, isActiveMonth(i) && colors.textOnPrimary]}
            >
              {month}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default MonthSelector;
