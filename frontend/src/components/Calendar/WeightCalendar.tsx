import { View } from "react-native";
import { Calendar, CalendarProvider, DateData } from "react-native-calendars";
import DayComponent from "./Day";
import { FC, useCallback, useState } from "react";
import DateUtils from "@/utils/dateUtils";
import { IWeighIn, IWeighInPost } from "@/interfaces/User";
import useCalendarTheme, { ExtendedMarking } from "@/themes/useCalendarTheme";
import useStyles from "@/styles/useGlobalStyles";
import WeightInputModal from "../WeightGraph/WeightInputModal";
import { DEFAULT_INITIAL_WEIGHT } from "@/constants/Constants";

interface WeightCalendarProps {
  weighIns: IWeighIn[];
  onSaveWeighIn: (weighIn: IWeighInPost, weighInId?: string | null, isNew?: boolean) => void;
  onDeleteWeighIn: (weighInId: string | null) => void;
}

const WeightCalendar: FC<WeightCalendarProps> = ({ weighIns, onSaveWeighIn, onDeleteWeighIn }) => {
  const { layout } = useStyles();

  const [selectedWeighInId, setSelectedWeighInId] = useState<string | null>(null);
  const [isEditWeighOpen, setIsEditWeightOpen] = useState(false);
  const [selected, setSelected] = useState(DateUtils.getCurrentDate("YYYY-MM-DD"));

  const { calendar, marked } = useCalendarTheme(weighIns, selected);

  const handleSaveWeighIn = useCallback(
    (updatedWeighIn: number) => {
      const isNew = !selectedWeighInId;
      const weighIn: Partial<IWeighInPost> = {
        weight: updatedWeighIn,
        date: selected,
      };

      console.log("weigh in", weighIn);
      console.log("weigh in id", selectedWeighInId);

      setIsEditWeightOpen(false);
      setSelectedWeighInId(null);
      onSaveWeighIn(weighIn, selectedWeighInId, isNew);
    },
    [selectedWeighInId, selected]
  );

  const handleDeleteWeighIn = useCallback(() => {
    if (!selectedWeighInId) return;

    onDeleteWeighIn(selectedWeighInId);
    setSelectedWeighInId(null);
    setIsEditWeightOpen(false);
  }, [selectedWeighInId]);

  const handleLongPressOnDay = (marking: ExtendedMarking, date: string | undefined) => {
    if (!date) return;
    const today = new Date();
    const selectedDate = DateUtils.convertToDate(date);

    // Set the selected date to the start of the day
    selectedDate.setHours(0, 0, 0, 0);

    // Set today to the end of the day
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const todayTime = endOfToday.getTime();
    const selectedDateTime = selectedDate.getTime();

    if (selectedDateTime > todayTime) return;
    setIsEditWeightOpen(true);
    handlePressOnDay(date);
    setSelectedWeighInId(marking?.weighInId || null);
  };

  const handlePressOnDay = (date: string | undefined) => {
    if (!date) return;
    setSelected(date);
  };

  const handleDismissWeightInputModal = () => {
    setIsEditWeightOpen(false);
    setSelectedWeighInId(null);
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
                    handleLongPressOnDay(marking, date?.dateString);
                  }}
                  onPress={() => {
                    handlePressOnDay(date.dateString);
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
          currentWeight={marked[selected]?.weight || DEFAULT_INITIAL_WEIGHT}
          handleSaveWeight={handleSaveWeighIn}
          handleDeleteWeighIn={selectedWeighInId ? handleDeleteWeighIn : undefined}
          handleDismiss={handleDismissWeightInputModal}
        />
      )}
    </>
  );
};

export default WeightCalendar;
