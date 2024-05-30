//@ts-nocheck

import { StyleSheet, View } from "react-native";
import { Calendar, CalendarProvider, DateData } from "react-native-calendars";
import { darkTheme } from "./calendarTheme";
import DayComponent from "./Day";
import { useMemo, useState } from "react";
import { MarkedDates } from "react-native-calendars/src/types";
import DateUtils from "@/utils/dateUtils";

const WeightCalendar = () => {
  const [selected, setSelected] = useState(DateUtils.getCurrentDate("YYYY-MM-DD"));

  const marked = useMemo(() => {
    return {
      [selected]: {
        selected: true,
        selectedColor: "#222222",
        selectedTextColor: "yellow",
      },
    };
  }, [selected]);

  console.log("marked", marked);
  console.log("selected", selected);

  return (
    <View className="flex-1">
      <CalendarProvider date="">
        <Calendar
          markedDates={marked}
          enableSwipeMonths
          onDayPress={(day) => {
            setSelected(day.dateString);
            props.onDaySelect && props.onDaySelect(day);
          }}
          hideExtraDays
          dayComponent={({ date, state, marking }) => {
            console.log(`day (${date?.day})states :${state}`);

            return (
              <DayComponent
                date={date?.day || 0}
                state={state || ""}
                marking={marking?.customStyles || { weight: "88kg" }}
                key={1}
                onPress={() => {
                  console.log("setting selected", date?.day);
                  setSelected(date.dateString);
                }}
              />
            );
          }}
          style={{ borderRadius: 4 }}
          theme={darkTheme}
        />
      </CalendarProvider>
    </View>
  );
};

export default WeightCalendar;

const styles = StyleSheet.create({});
