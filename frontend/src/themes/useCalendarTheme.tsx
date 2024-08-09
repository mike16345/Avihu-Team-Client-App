import { useMemo } from "react";
import { IWeighIn } from "@/interfaces/User";
import { ExtendedMarking } from "@/components/Calendar/WeightCalendar";
import { StyleSheet } from "react-native";
import { useThemeContext } from "./useAppTheme";

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
    const calendar = {
      calendarBackground: theme.colors.secondaryContainer,
      textSectionTitleColor: theme.colors.primary,
      textSectionTitleDisabledColor: theme.colors.secondary,
      dayTextColor: theme.colors.onSurface,
      selectedDayTextColor: theme.colors.onPrimary,
      monthTextColor: theme.colors.primary,
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
      todayButtonTextColor: theme.colors.primary,
      todayButtonPosition: "center",
      arrowHeight: 15,
      arrowWidth: 15,
      weekVerticalMargin: 5,
    };

    const dayStyles = StyleSheet.create({
      dayContainer: {
        alignItems: "center",
        padding: 5,
      },
      selected: {
        borderRadius: 9999,
        backgroundColor: theme.colors.info,
        paddingHorizontal: 8,
        paddingVertical: 0,
      },
      dateText: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        fontWeight: "600",
        fontSize: 14,
        color: theme.colors.onBackground,
      },
      disabledText: {
        color: theme.colors.surfaceDisabled,
      },
      valueText: {
        color: theme.colors.primary,
        fontWeight: "400",
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
