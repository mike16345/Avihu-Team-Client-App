import { View } from "react-native";
import { Calendar, CalendarProvider, DateData } from "react-native-calendars";
import DayComponent from "./Day";
import { FC, useState } from "react";
import DateUtils from "@/utils/dateUtils";
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking";
import { IWeighIn, IWeighInPost } from "@/interfaces/User";
import useCalendarTheme from "@/themes/useCalendarTheme";
import useStyles from "@/styles/useGlobalStyles";
import WeightInputModal from "../WeightGraph/WeightInputModal";
import { useWeighInApi } from "@/hooks/useWeighInApi";
import { useUserStore } from "@/store/userStore";

export interface ExtendedMarking extends MarkingProps {
  weight?: number;
  customStyles?: any;
  weighInId?: string;
}

interface WeightCalendarProps {
  weighIns: IWeighIn[];
}

const WeightCalendar: FC<WeightCalendarProps> = ({ weighIns }) => {
  const { addWeighIn, updateWeighInById } = useWeighInApi();
  const currentUser = useUserStore((state) => state.currentUser);
  const [selected, setSelected] = useState(DateUtils.getCurrentDate("YYYY-MM-DD"));

  const { calendar, marked } = useCalendarTheme(weighIns, selected);
  const { layout } = useStyles();

  const [selectedWeighInId, setSelectedWeighInId] = useState<string | null>(null);
  const [isEditWeighOpen, setIsEditWeightOpen] = useState(false);

  const handleSaveWeighIn = (updatedWeighIn: number) => {
    const weighIn: Partial<IWeighInPost> = {
      weight: updatedWeighIn,
    };

    setIsEditWeightOpen(false);

    if (selectedWeighInId) {
      updateWeighInById(selectedWeighInId, weighIn)
        .then((res) => {
          console.log("Res", res);

          if (res.modifiedCount == 1) {
            console.log("succeeded");
          } else {
            console.error("Failed to update weight");
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {});

      return;
    }

    if (!currentUser) return;

    addWeighIn(currentUser._id, weighIn)
      .then((res) => {
        console.log("Res", res);
      })
      .catch((err) => {
        console.error(err);
      });
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
                  onLongPress={() => {
                    console.log("marking", marking);

                    if (!marking) return;
                    setSelected(date.dateString);
                    setSelectedWeighInId(marking.weighInId);
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
