import { semanticColors } from "@/themes/semanticColors";
import { useMemo } from "react";
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking";
import useStyles from "@/styles/useGlobalStyles";
import { Theme } from "react-native-calendars/src/types";

export interface ExtendedMarking extends MarkingProps {
  weight?: number;
  customStyles?: any;
  weighInId?: string;
}

interface MarkedDays {
  [key: string]: ExtendedMarking;
}

const DAY_HEADER_COLOR = semanticColors.scrim;
const TODAY_TEXT_COLOR = semanticColors.calendar.today;

const useCalendarTheme = (
  today: string = "",
  selected: string = "",
  highlightedDates: string[]
) => {
  const { colors, common } = useStyles();

  const { marked, theme }: { marked: MarkedDays; theme: Theme } = useMemo(() => {
    // base theme
    const theme = {
      "stylesheet.calendar.header": {
        dayTextAtIndex0: { color: DAY_HEADER_COLOR },
        dayTextAtIndex1: { color: DAY_HEADER_COLOR },
        dayTextAtIndex2: { color: DAY_HEADER_COLOR },
        dayTextAtIndex3: { color: DAY_HEADER_COLOR },
        dayTextAtIndex4: { color: DAY_HEADER_COLOR },
        dayTextAtIndex5: { color: DAY_HEADER_COLOR },
        dayTextAtIndex6: { color: DAY_HEADER_COLOR },
        dayTextAtIndex7: { color: DAY_HEADER_COLOR },
      },
      "stylesheet.day.basic": {
        base: {
          width: 32,
          height: 32,
          alignItems: "center",
          justifyContent: "center",
        },
        text: {
          marginTop: 0,
          fontSize: 16,
          fontFamily: "Assistant-Regular",
          fontWeight: "400",
          color: semanticColors.calendar.agendaText,
        },
        dot: {
          width: 4,
          height: 4,
          marginTop: 2,
          marginBottom: 4,
          borderRadius: 2,
          opacity: 1,
        },
        dotContainer: {
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 2, // Space between number and dots
          marginBottom: 4, // Space between dots and bottom edge
        },
      },
      weekVerticalMargin: 2,
      textDayFontFamily: "Assistant-Regular",
      textMonthFontFamily: "Assistant-Regular",
      textDayHeaderFontFamily: "Assistant-SemiBold",
      textDayFontSize: 16,
      textMonthFontSize: 16,
      textDayHeaderFontSize: 16,
    };

    // base marked (selected + today)
    const baseMarked: MarkedDays = {
      [selected]: {
        customStyles: {
          container: {
            backgroundColor: colors.backgroundSuccessContainer.backgroundColor,
            borderRadius: common.roundedSm.borderRadius,
          },
          text: { color: colors.textPrimary.color },
        },
        disableTouchEvent: true,
        selected: true,
        selectedColor: "blue",
      },
      [today]: {
        customStyles: {
          container: {
            backgroundColor: colors.backgroundPrimary.backgroundColor,
            borderRadius: common.roundedSm.borderRadius,
          },
          text: { color: TODAY_TEXT_COLOR },
        },
      },
    };

    // add dots for array of dates
    highlightedDates.forEach((date) => {
      baseMarked[date] = {
        ...(baseMarked[date] || {}), // preserve existing styles
        marked: true,
        dotColor: semanticColors.calendar.dot,
        dots: [
          {
            key: "highlight",
            color: semanticColors.calendar.dotSelected,
            selectedDotColor: semanticColors.calendar.dotSelected,
          },
        ],
      };
    });

    return { marked: baseMarked, theme };
  }, [selected, today, highlightedDates, colors, common]);

  return { marked, theme };
};

export default useCalendarTheme;
