import { View, TouchableOpacity } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import Icon from "../Icon/Icon";
import { Text } from "../ui/Text";

interface CalendarHeaderProps {
  month: string;
  year: number;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
  onOpenMonthSelect: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  goToNextMonth,
  goToPreviousMonth,
  month,
  year,
  onOpenMonthSelect,
}) => {
  const { fonts, layout, spacing } = useStyles();

  return (
    <View
      style={[
        layout.flexRow,
        layout.justifyBetween,
        layout.itemsCenter,
        layout.widthFull,
        spacing.pdVerticalDefault,
      ]}
    >
      <TouchableOpacity
        style={[layout.flexRow, spacing.gapXs, layout.itemsCenter]}
        onPress={onOpenMonthSelect}
      >
        <Text style={fonts.lg}>
          {month} {year}
        </Text>
        <Icon name="chevronLeftSoft" height={18} width={25} />
      </TouchableOpacity>

      <View style={[layout.flexRow, spacing.gapDefault]}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Icon name="chevronRightSoft" height={18} width={18} />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNextMonth}>
          <Icon name="chevronLeftSoft" height={18} width={18} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CalendarHeader;
