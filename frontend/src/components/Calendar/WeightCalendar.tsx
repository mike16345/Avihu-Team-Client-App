import { TextInput, View, Text } from "react-native";
import { Calendar, CalendarProvider, DateData } from "react-native-calendars";
import DayComponent from "./Day";
import { FC, useMemo, useState } from "react";
import DateUtils from "@/utils/dateUtils";
import { Colors } from "@/constants/Colors";
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking";
import { IWeighIn } from "@/interfaces/User";
import { Dialog, Button } from "react-native-paper";
import useCalendarTheme from "@/themes/useCalendarTheme";

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
  const calendarTheme = useCalendarTheme();

  const [selected, setSelected] = useState(DateUtils.getCurrentDate("YYYY-MM-DD"));
  const [isEditWeighOpen, setIsEditWeightOpen] = useState(false);

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
    <>
      <View className="flex-1">
        <CalendarProvider date={selected}>
          <Calendar
            markedDates={marked}
            enableSwipeMonths
            onDayPress={(day: DateData) => {
              setSelected(day.dateString);
            }}
            dayComponent={({ date, state, marking }: DateData) => {
              return (
                <DayComponent
                  date={date?.day || 0}
                  state={state || ""}
                  marking={marking}
                  key={1}
                  onLongPress={() => {
                    if (!date) return;
                    setSelected(date.dateString);
                    setIsEditWeightOpen(true);
                  }}
                  onPress={() => {
                    if (!date) return;
                    setSelected(date.dateString);
                  }}
                />
              );
            }}
            hideExtraDays
            style={{ borderRadius: 12, padding: 4 }}
            theme={calendarTheme}
          />
        </CalendarProvider>
      </View>
      <Dialog onDismiss={() => setIsEditWeightOpen(false)} visible={isEditWeighOpen}>
        <Dialog.Title>HI</Dialog.Title>
        <View>
          <View style={{ flex: 1, gap: 20, justifyContent: "center" }}>
            <View className="  flex-row-reverse items-center justify-between ">
              <Text className=" text-lg  font-bold text-white">משקל:</Text>
              <TextInput
                onChangeText={(val) => console.log(val)}
                className="inpt  h-10 w-24 ml-2"
                keyboardType="number-pad"
              />
            </View>
          </View>
          <Button onPress={() => console.log("update weight")}>
            <Text className="font-bold text-lg">שמור</Text>
          </Button>
        </View>
      </Dialog>
    </>
  );
};

export default WeightCalendar;
