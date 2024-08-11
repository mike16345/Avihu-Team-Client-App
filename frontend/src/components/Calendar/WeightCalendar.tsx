import { View } from "react-native";
import { Calendar, CalendarProvider, DateData } from "react-native-calendars";
import DayComponent from "./Day";
import { FC, useState } from "react";
import DateUtils from "@/utils/dateUtils";
import { IWeighIn, IWeighInPost } from "@/interfaces/User";
import useCalendarTheme from "@/themes/useCalendarTheme";
import useStyles from "@/styles/useGlobalStyles";
import WeightInputModal from "../WeightGraph/WeightInputModal";

interface WeightCalendarProps {
  weighIns: IWeighIn[];
  onSaveWeighIn: (weighIn: IWeighInPost, weighInId?: string | null, isNew?: boolean) => void;
}

const WeightCalendar: FC<WeightCalendarProps> = ({ weighIns, onSaveWeighIn }) => {
  const { layout } = useStyles();

  const [selectedWeighInId, setSelectedWeighInId] = useState<string | null>(null);
  const [isEditWeighOpen, setIsEditWeightOpen] = useState(false);
  const [selected, setSelected] = useState(DateUtils.getCurrentDate("YYYY-MM-DD"));

  const { calendar, marked } = useCalendarTheme(weighIns, selected);

  const handleSaveWeighIn = (updatedWeighIn: number) => {
    const isNew = !selectedWeighInId;
    const weighIn: Partial<IWeighInPost> = {
      weight: updatedWeighIn,
      date: selected,
    };

    setIsEditWeightOpen(false);
    setSelectedWeighInId(null);
    onSaveWeighIn(weighIn, selectedWeighInId, isNew);
  };

  return (
    <>
      <View key={calendar.calendarBackground} style={layout.flex1}>
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
                  delayLongPress={100}
                  onLongPress={() => {
                    setSelected(date.dateString);
                    setIsEditWeightOpen(true);
                    if (!marking) return;
                    setSelectedWeighInId(marking.weighInId);
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
      {isEditWeighOpen && (
        <WeightInputModal
          currentWeight={marked[selected]?.weight || 0}
          handleSaveWeight={handleSaveWeighIn}
          handleDismiss={() => setIsEditWeightOpen(false)}
        />
      )}
    </>
  );
};

export default WeightCalendar;
