import React from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { DayState } from "react-native-calendars/src/types";
import useFontSize from "@/styles/useFontSize";
import useCalendarTheme, { ExtendedMarking } from "@/themes/useCalendarTheme";

interface DayComponentProps extends TouchableOpacityProps {
  date: number;
  state: DayState;
  marking?: ExtendedMarking;
}

const DayComponent: React.FC<DayComponentProps> = ({ date, state, marking, ...props }) => {
  const dayStyles = useCalendarTheme().dayStyles;
  const fontSize = useFontSize();
  const { weight, selected } = marking || {};

  return (
    <TouchableOpacity
      {...props}
      style={[dayStyles.dayContainer, state == "today" && dayStyles.todayContainer]}
    >
      <Text
        style={[dayStyles.dateText, selected && dayStyles.selected, fontSize.md]}
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
