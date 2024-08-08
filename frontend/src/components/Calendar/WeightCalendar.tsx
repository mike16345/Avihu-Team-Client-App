import { TextInput, View, Text } from "react-native";
import { Calendar, CalendarProvider, DateData } from "react-native-calendars";
import DayComponent from "./Day";
import { FC, useState } from "react";
import DateUtils from "@/utils/dateUtils";
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking";
import { IWeighIn } from "@/interfaces/User";
import { Button } from "react-native-paper";
import useCalendarTheme from "@/themes/useCalendarTheme";
import { useLayoutStyles } from "@/styles/useLayoutStyles";
import { CustomModal } from "../ui/Modal";
import { useThemeContext } from "@/themes/useAppTheme";
import useCommonStyles from "@/styles/useCommonStyles";

export interface ExtendedMarking extends MarkingProps {
  weight?: number;
  customStyles?: any;
}

interface WeightCalendarProps {
  weighIns: IWeighIn[];
}

const WeightCalendar: FC<WeightCalendarProps> = ({ weighIns }) => {
  const { theme } = useThemeContext();
  const [selected, setSelected] = useState(DateUtils.getCurrentDate("YYYY-MM-DD"));

  const { calendar, marked } = useCalendarTheme(weighIns, selected);
  const layoutStyles = useLayoutStyles();
  const commonStyles = useCommonStyles();

  const [isEditWeighOpen, setIsEditWeightOpen] = useState(false);

  return (
    <>
      <View key={calendar.calendarBackground} style={layoutStyles.flex1}>
        <CalendarProvider date={selected}>
          <Calendar
            markedDates={marked}
            enableSwipeMonths
            onDayPress={(day: DateData) => {
              setSelected(day.dateString);
            }}
            //@ts-ignore
            dayComponent={({ date, state, marking }: DateData) => {
              return (
                <DayComponent
                  date={date?.day || 0}
                  state={state || ""}
                  marking={marking}
                  key={date?.day}
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
            theme={calendar}
          />
        </CalendarProvider>
      </View>
      <CustomModal
        contentContainerStyle={{ padding: 20 }}
        style={[
          layoutStyles.alignItemsStart,
          commonStyles.paddingLarge,
          {
            position: "absolute",

            height: "50%",
            backgroundColor: theme.colors.secondaryContainer,
          },
        ]}
        onDismiss={() => setIsEditWeightOpen(false)}
        visible={isEditWeighOpen}
      >
        <Text>Hi</Text>
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

        <Button mode="contained" onPress={() => console.log("update weight")}>
          <Text className="font-bold text-lg">שמור</Text>
        </Button>
      </CustomModal>
    </>
  );
};

export default WeightCalendar;
