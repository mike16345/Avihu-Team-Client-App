import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { DayState } from "react-native-calendars/src/types";
import { ExtendedMarking } from "./WeightCalendar";
import useFontSize from "@/styles/useFontSize";
import useCalendarTheme from "@/themes/useCalendarTheme";

interface DayComponentProps {
  date: number;
  state: DayState;
  marking?: ExtendedMarking;
  onPress: () => void;
  onLongPress: () => void;
}

const DayComponent: React.FC<DayComponentProps> = ({
  date,
  state,
  marking,
  onPress,
  onLongPress,
}) => {
  const dayStyles = useCalendarTheme().dayStyles;
  const fontSize = useFontSize();
  const { weight, selected } = marking || {};

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[dayStyles.dayContainer, state == "today" && dayStyles.todayContainer]}
    >
      <Text
        style={[dayStyles.dateText, selected && dayStyles.selected, fontSize.default]}
        maxFontSizeMultiplier={1}
      >
        {date}
      </Text>
      {weight && (
        <Text style={[dayStyles.valueText, fontSize.md]} maxFontSizeMultiplier={1.5}>
          {weight}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default DayComponent;
