import { View } from "react-native";
import CustomCalendar from "./CustomCalendar";
import { useState } from "react";

const WeighInsCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  return (
    <View>
      <CustomCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
    </View>
  );
};

export default WeighInsCalendar;
