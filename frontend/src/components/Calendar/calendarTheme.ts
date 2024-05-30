import { Colors } from "@/constants/Colors";
import { Theme } from "react-native-calendars/src/types";

export const darkTheme: Theme = {
  calendarBackground: Colors.bgSecondry,
  textSectionTitleColor: Colors.primary,
  textSectionTitleDisabledColor: Colors.secondary,
  dayTextColor: Colors.light,
  selectedDayTextColor: Colors.dark,
  monthTextColor: Colors.primary,
  selectedDayBackgroundColor: Colors.primary,
  arrowColor: Colors.primary,
  textDisabledColor: Colors.dark,
  textInactiveColor: Colors.secondary,
  backgroundColor: Colors.bgSecondry,
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
        backgroundColor: Colors.bgSecondry,
      },
      header: {
        backgroundColor: Colors.bgSecondry,
      },
    },
    day: {
      basic: {
        backgroundColor: Colors.bgSecondry,
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
        backgroundColor: Colors.bgSecondry,
      },
    },
    agenda: {
      main: {
        backgroundColor: Colors.bgSecondry,
      },
      list: {
        backgroundColor: Colors.bgSecondry,
      },
    },
    expandable: {
      main: {
        backgroundColor: Colors.bgSecondry,
      },
    },
  },
};
