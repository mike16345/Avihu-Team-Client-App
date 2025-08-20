import { View } from "react-native";
import CustomCalendar from "./CustomCalendar";
import { useMemo, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import SelectedCard from "../ui/graph/SelectedCard";
import { ConditionalRender } from "../ui/ConditionalRender";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import DateUtils from "@/utils/dateUtils";

const WeighInsCalendar = () => {
  const { data } = useWeighInsQuery();
  const { spacing } = useStyles();

  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  const weighInMap = useMemo(() => {
    if (!data) return {};
    const map: Record<string, number> = {};

    for (const w of data) {
      const dateKey = DateUtils.formatDate(w.date, "YYYY-MM-DD");
      map[dateKey] = w.weight;
    }

    return map;
  }, [data]);

  return (
    <View style={[spacing.gapDefault]}>
      <CustomCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
      <ConditionalRender condition={!!selectedDate && !!weighInMap[selectedDate]}>
        <SelectedCard
          selected={weighInMap[selectedDate!]}
          onClose={() => setSelectedDate(undefined)}
        />
      </ConditionalRender>
    </View>
  );
};

export default WeighInsCalendar;
