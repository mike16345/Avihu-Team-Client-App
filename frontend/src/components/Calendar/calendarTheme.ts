import { Colors } from "@/constants/Colors";
import { Theme } from "react-native-calendars/src/types";

export const darkTheme: Theme = {
  calendarBackground: Colors.bgSecondary,
  textSectionTitleColor: Colors.primary,
  textSectionTitleDisabledColor: Colors.secondary,
  dayTextColor: Colors.light,
  selectedDayTextColor: Colors.dark,
  monthTextColor: Colors.primary,
  selectedDayBackgroundColor: Colors.primary,
  arrowColor: Colors.primary,
  textDisabledColor: Colors.dark,
  textInactiveColor: Colors.secondary,
  backgroundColor: Colors.bgSecondary,
  dotColor: Colors.primary,
  selectedDotColor: Colors.primary,
  disabledArrowColor: Colors.secondary,
  agendaDayTextColor: Colors.light,
  agendaDayNumColor: Colors.primary,
  agendaTodayColor: Colors.primary,
  agendaKnobColor: Colors.primary,
  todayTextColor: Colors.primary,
  todayBackgroundColor: Colors.bgPrimary,
  todayDotColor: Colors.primary,
  textDayFontWeight: "400",
  textMonthFontWeight: "600",
  textDayHeaderFontWeight: "600",
  textDayFontSize: 16,
  textMonthFontSize: 18,
  textDayHeaderFontSize: 16,
  todayButtonFontWeight: "600",
  todayButtonFontSize: 14,
  todayButtonTextColor: Colors.primary,
  todayButtonPosition: "center",
  arrowHeight: 15,
  arrowWidth: 15,
  weekVerticalMargin: 5,
  stylesheet: {
    calendar: {
      main: {
        backgroundColor: Colors.bgSecondary,
      },
      header: {
        backgroundColor: Colors.bgSecondary,
      },
    },
    day: {
      basic: {
        backgroundColor: Colors.bgSecondary,
        color: Colors.light,
      },
      period: {
        backgroundColor: Colors.primary,
      },
    },
    dot: {
      backgroundColor: Colors.primary,
    },
    marking: {
      backgroundColor: Colors.primary,
    },
    "calendar-list": {
      main: {
        backgroundColor: Colors.bgSecondary,
      },
    },
    agenda: {
      main: {
        backgroundColor: Colors.bgSecondary,
      },
      list: {
        backgroundColor: Colors.bgSecondary,
      },
    },
    expandable: {
      main: {
        backgroundColor: Colors.bgSecondary,
      },
    },
  },
};
