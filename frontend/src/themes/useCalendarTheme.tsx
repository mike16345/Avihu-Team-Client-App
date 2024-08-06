import { useAppTheme } from "./useAppTheme";

const useCalendarTheme = () => {
  const theme = useAppTheme();
  console.log("background theme", theme.colors.background);

  return {
    calendarBackground: theme.colors.background,
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
    stylesheet: {
      calendar: {
        main: {
          backgroundColor: theme.colors.background,
        },
        header: {
          backgroundColor: theme.colors.background,
        },
      },
      day: {
        basic: {
          backgroundColor: theme.colors.background,
          color: theme.colors.onSurface,
        },
        period: {
          backgroundColor: theme.colors.primary,
        },
      },
      dot: {
        backgroundColor: theme.colors.primary,
      },
      marking: {
        backgroundColor: theme.colors.primary,
      },
      "calendar-list": {
        main: {
          backgroundColor: theme.colors.background,
        },
      },
      agenda: {
        main: {
          backgroundColor: theme.colors.background,
        },
        list: {
          backgroundColor: theme.colors.background,
        },
      },
      expandable: {
        main: {
          backgroundColor: theme.colors.background,
        },
      },
    },
  };
};

export default useCalendarTheme;
