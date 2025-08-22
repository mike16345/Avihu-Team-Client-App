import { View } from "react-native";
import React, { useState } from "react";
import { Calendar, DateData } from "react-native-calendars";
import useStyles from "@/styles/useGlobalStyles";
import moment from "moment";
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
  const { common, spacing } = useStyles();

  const today = DateUtils.getCurrentDate("YYYY-MM-DD");

  const [currentDate, setCurrentDate] = useState(selectedDate || today);
  const [showMonths, setShowMonths] = useState(false);

  const month = DateUtils.extractMonthFromDate(currentDate);
  const year = DateUtils.extractYearFromDate(currentDate);

  const { theme, marked } = useCalendarTheme(today, selectedDate);

  const handleSelect = (day: DateData) => {
    const date = day.dateString;
    console.log("date", date);

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
      <View style={{ display: !showMonths ? "flex" : "none" }}>
        <Calendar
          style={[common.roundedSm, spacing.pdDefault]}
          key={currentDate}
          current={currentDate}
          onDayPress={handleSelect}
          onMonthChange={({ dateString }: DateData) => handleMonthChange(dateString)}
          markingType="custom"
          markedDates={marked}
          theme={theme}
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
      </View>
      <View style={{ display: showMonths ? "flex" : "none" }}>
        <MonthSelector
          activeMonthIndex={month}
          onCloseMonthSelect={() => setShowMonths(false)}
          onMonthSelect={(monthIndex) => handleMonthSelect(monthIndex)}
        />
      </View>
    </View>
  );
};

export default CustomCalendar;
