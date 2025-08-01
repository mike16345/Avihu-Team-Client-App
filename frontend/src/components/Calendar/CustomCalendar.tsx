import { View } from "react-native";
import React, { useState } from "react";
import { Calendar, DateData } from "react-native-calendars";
import useStyles from "@/styles/useGlobalStyles";
import moment from "moment";
import { ConditionalRender } from "../ui/ConditionalRender";
import useCalendarTheme from "@/themes/useCalendarTheme";
import { monthNames, setupCalendarLocale } from "@/config/calendarConfig";
import CalendarHeader from "./CalendarHeader";
import MonthSelector from "./MonthSelector";
import DateUtils from "@/utils/dateUtils";

setupCalendarLocale();

interface CustomCalendarProps {
  selectedDate?: string;
  onSelect: (date: string) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ onSelect, selectedDate }) => {
  const { common } = useStyles();

  const today = DateUtils.getCurrentDate("YYYY-MM-DD");

  const [currentDate, setCurrentDate] = useState(selectedDate || today);
  const [selected, setSelected] = useState(selectedDate || today);
  const [showMonths, setShowMonths] = useState(false);

  const month = DateUtils.extractMonthFromDate(currentDate);
  const year = DateUtils.extractYearFromDate(currentDate);

  const { marked } = useCalendarTheme(today, selected);

  const handleSelect = (day: DateData) => {
    const date = day.dateString;

    setSelected(date);
    onSelect(date);
  };

  const handleMonthChange = (date: string) => {
    setCurrentDate(date);
  };

  const handleMonthSelect = (selectedMonthIndex: number) => {
    setCurrentDate(moment().year(year).month(selectedMonthIndex).date(1).format("YYYY-MM-DD"));
  };

  const goToNextMonth = () => {
    const next = moment(currentDate).add(1, "month").format("YYYY-MM-DD");
    setCurrentDate(next);
  };

  const goToPreviousMonth = () => {
    const prev = moment(currentDate).subtract(1, "month").format("YYYY-MM-DD");
    setCurrentDate(prev);
  };

  return (
    <View style={[{ position: "relative" }, common.rounded]}>
      <ConditionalRender condition={!showMonths}>
        <Calendar
          style={[common.rounded]}
          key={currentDate}
          current={currentDate}
          onDayPress={handleSelect}
          onMonthChange={({ dateString }: DateData) => handleMonthChange(dateString)}
          enableSwipeMonths
          markingType="custom"
          markedDates={marked}
          renderHeader={() => (
            <CalendarHeader
              month={monthNames[month]}
              year={year}
              goToNextMonth={goToNextMonth}
              goToPreviousMonth={goToPreviousMonth}
              onOpenMonthSelect={() => setShowMonths(true)}
            />
          )}
          hideArrows
        />
      </ConditionalRender>

      <ConditionalRender condition={showMonths}>
        <MonthSelector
          activeMonthIndex={month}
          onCloseMonthSelect={() => setShowMonths(false)}
          onMonthSelect={(monthIndex) => handleMonthSelect(monthIndex)}
        />
      </ConditionalRender>
    </View>
  );
};

export default CustomCalendar;
