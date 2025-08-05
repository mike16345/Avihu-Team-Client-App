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

  const marked: MarkedDays = useMemo(() => {
    return {
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
    };
  }, [selected, today]);

  return { marked };
};

export default useCalendarTheme;
