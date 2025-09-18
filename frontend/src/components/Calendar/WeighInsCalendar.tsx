import { View } from "react-native";
import CustomCalendar from "./CustomCalendar";
import { useMemo, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ui/ConditionalRender";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import DateUtils from "@/utils/dateUtils";
import { Text } from "../ui/Text";
import { IWeighIn } from "@/interfaces/User";
import EditWeighIn from "./EditWeighIn";

const WeighInsCalendar = () => {
  const { data } = useWeighInsQuery();
  const { spacing, layout } = useStyles();

  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  const weighInMap = useMemo(() => {
    if (!data) return {};
    const map: Record<string, IWeighIn> = {};

    for (const w of data) {
      const dateKey = DateUtils.formatDate(w.date, "YYYY-MM-DD");
      map[dateKey] = w;
    }

    return map;
  }, [data]);

  return (
    <View style={[spacing.gapDefault]}>
      <CustomCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
      <ConditionalRender condition={!!selectedDate && !!weighInMap[selectedDate]}>
        <View style={[layout.center, spacing.gapMd]}>
          <Text fontSize={16}>{DateUtils.formatDate(selectedDate!, "DD.MM.YYYY")}</Text>
          <View style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}>
            <Text fontSize={16}>משקל {weighInMap[selectedDate!]?.weight}</Text>

            <EditWeighIn date={selectedDate || ""} weighInToEdit={weighInMap[selectedDate || ""]} />
          </View>
        </View>
      </ConditionalRender>
    </View>
  );
};

export default WeighInsCalendar;
