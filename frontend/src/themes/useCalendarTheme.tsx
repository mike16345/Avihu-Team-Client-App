import { useMemo } from "react";
import { IWeighIn } from "@/interfaces/User";
import { StyleSheet } from "react-native";
import { useThemeContext } from "./useAppTheme";
import { Theme } from "react-native-calendars/src/types";
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking";
export interface ExtendedMarking extends MarkingProps {
  weight?: number;
  customStyles?: any;
  weighInId?: string;
}

interface MarkedDays {
  [key: string]: ExtendedMarking;
}

const useCalendarTheme = (weighIns: IWeighIn[] = [], selected: string = "") => {
  const { theme } = useThemeContext();

  const marked: MarkedDays = useMemo(() => {
    const marks: MarkedDays = {};

    weighIns.forEach((weighIn) => {
      const dateString = new Date(weighIn.date).toISOString().split("T")[0];

      marks[dateString] = {
        selected: selected === dateString,
        selectedColor: theme.colors.primary,
        dotColor: theme.colors.warning,
        marked: true,
        selectedTextColor: theme.colors.error,
        dots: [
          {
            color: theme.colors.primary,
            key: dateString,
            selectedDotColor: theme.colors.primaryContainer,
          },
        ],
        weighInId: weighIn._id,
        weight: weighIn.weight,
      };
    });

    return marks;
  }, [selected, weighIns, theme.colors]);

  const styles = useMemo(() => {
    const calendar: Theme = {
      calendarBackground: theme.colors.secondaryContainer,
      textSectionTitleColor: theme.colors.onSecondaryContainer,
      textSectionTitleDisabledColor: theme.colors.secondary,
      dayTextColor: theme.colors.onSecondaryContainer,
      selectedDayTextColor: theme.colors.onSecondaryContainer,
      monthTextColor: theme.colors.onSecondaryContainer,
      selectedDayBackgroundColor: theme.colors.primary,
      arrowColor: theme.colors.primary,
      textDisabledColor: theme.colors.surfaceDisabled,
      textInactiveColor: theme.colors.secondary,
      backgroundColor: theme.colors.background,
      dotColor: theme.colors.primary,
      selectedDotColor: theme.colors.primary,
      disabledArrowColor: theme.colors.secondary,
      agendaDayTextColor: theme.colors.onSurface,
      agendaDayNumColor: theme.colors.primary,
      agendaTodayColor: theme.colors.primary,
      agendaKnobColor: theme.colors.primary,
      todayTextColor: theme.colors.primary,
      todayBackgroundColor: theme.colors.primaryContainer,
      todayDotColor: theme.colors.primary,
      textDayFontWeight: "400",
      textMonthFontWeight: "600",
      textDayHeaderFontWeight: "600",
      textDayFontSize: 16,
      textMonthFontSize: 18,
      textDayHeaderFontSize: 16,
      todayButtonFontWeight: "600",
      todayButtonFontSize: 14,
      todayButtonTextColor: theme.colors.onSecondaryContainer,
      todayButtonPosition: "center",
      arrowHeight: 25,
      arrowWidth: 15,
      weekVerticalMargin: 8,
    };

    const dayStyles = StyleSheet.create({
      dayContainer: {
        alignItems: "center",
        paddingHorizontal: 2,
      },
      selected: {
        borderRadius: 16,
        backgroundColor: theme.colors.info,
        paddingHorizontal: 8,
      },
      dateText: {
        fontWeight: "600",
        fontSize: 14,
        color: theme.colors.onBackground,
      },
      disabledText: {
        color: theme.colors.surfaceDisabled,
      },
      valueText: {
        color: theme.colors.primary,
        fontWeight: "900",
      },
      todayContainer: {
        borderBottomWidth: 2,
        borderRadius: 4,
        borderBottomColor: theme.colors.info,
      },
    });

    return {
      dayStyles,
      calendar,
    };
  }, [theme]);

  return { ...styles, marked };
};

export default useCalendarTheme;
