import { useMemo } from "react";
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking";
import useStyles from "@/styles/useGlobalStyles";
export interface ExtendedMarking extends MarkingProps {
  weight?: number;
  customStyles?: any;
  weighInId?: string;
}

interface MarkedDays {
  [key: string]: ExtendedMarking;
}

const useCalendarTheme = (today: string = "", selected: string = "") => {
  const { colors, common } = useStyles();

  const { marked, theme }: { marked: MarkedDays; theme: Record<any, any> } = useMemo(() => {
    return {
      theme: {
        "stylesheet.calendar.header": {
          dayTextAtIndex0: {
            color: "#000",
          },
          dayTextAtIndex1: {
            color: "#000",
          },
          dayTextAtIndex2: {
            color: "#000",
          },
          dayTextAtIndex3: {
            color: "#000",
          },
          dayTextAtIndex4: {
            color: "#000",
          },
          dayTextAtIndex5: {
            color: "#000",
          },
          dayTextAtIndex6: {
            color: "#000",
          },
          dayTextAtIndex7: {
            color: "#000",
          },
        },
        weekVerticalMargin: 2.5,

        textDayFontFamily: "Assistant-Regular",
        textMonthFontFamily: "Assistant-Regular",
        textDayHeaderFontFamily: "Assistant-SemiBold",
        textDayFontSize: 16,
        textMonthFontSize: 16,
        textDayHeaderFontSize: 16,
      },
      marked: {
        [selected]: {
          customStyles: {
            container: {
              backgroundColor: colors.backgroundSuccessContainer.backgroundColor,
              borderRadius: common.rounded.borderRadius,
            },
            text: {
              color: colors.textPrimary.color,
            },
          },
          disableTouchEvent: true,
          selected: true,
        },
        [today]: {
          customStyles: {
            container: {
              backgroundColor: colors.backgroundPrimary.backgroundColor,
              borderRadius: common.rounded.borderRadius,
            },
            text: {
              color: colors.textOnPrimary.color,
            },
          },
        },
      },
    };
  }, [selected, today]);

  return { marked, theme };
};

export default useCalendarTheme;
