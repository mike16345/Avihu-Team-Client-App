import { View } from "react-native";
import { Calendar, CalendarProvider } from "react-native-calendars";
import { darkTheme } from "./calendarTheme";
import DayComponent from "./Day";
import { FC, useMemo, useState } from "react";
import DateUtils from "@/utils/dateUtils";
import { Colors } from "@/constants/Colors";
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking";
import { IWeighIn } from "@/interfaces/User";

export interface ExtendedMarking extends MarkingProps {
  weight?: number;
  customStyles?: any;
}
interface MarkedDays {
  [key: string]: ExtendedMarking;
}

interface WeightCalendarProps {
  weighIns: IWeighIn[];
}

const WeightCalendar: FC<WeightCalendarProps> = ({ weighIns }) => {
  const [selected, setSelected] = useState(DateUtils.getCurrentDate("YYYY-MM-DD"));

  const marked: MarkedDays = useMemo(() => {
    const marks: MarkedDays = {};

    weighIns.forEach((weighIn) => {
      const dateString = new Date(weighIn.date).toISOString().split("T")[0];

      marks[dateString] = {
        selected: selected === dateString,
        selectedColor: Colors.primary,
        dotColor: Colors.warning,
        marked: true,
        selectedTextColor: Colors.danger,
        dots: [
          { color: Colors.primaryDark, key: dateString, selectedDotColor: Colors.primaryLight },
        ],
        weight: weighIn.weight,
      };
    });

    return marks;
  }, [selected]);

  return (
    <View className="flex-1">
      <CalendarProvider date={selected}>
        <Calendar
          markedDates={marked}
          enableSwipeMonths
          onDayPress={(day) => {
            setSelected(day.dateString);
          }}
          dayComponent={({ date, state, marking }) => {
            return (
              <DayComponent
                date={date?.day || 0}
                state={state || ""}
                marking={marking}
                key={1}
                onPress={() => {
                  if (!date) return;
                  setSelected(date.dateString);
                }}
              />
            );
          }}
          hideExtraDays
          style={{ borderRadius: 12, padding: 4 }}
          theme={darkTheme}
        />
      </CalendarProvider>
    </View>
  );
};

export default WeightCalendar;
