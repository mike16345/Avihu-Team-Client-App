import { View } from "react-native";
import CustomCalendar from "./CustomCalendar";
import { useMemo, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ui/ConditionalRender";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import DateUtils from "@/utils/dateUtils";
import { Text } from "../ui/Text";
import { IWeighIn } from "@/interfaces/User";
import { extractValuesFromObject } from "@/utils/utils";
import UpdateWeighIn from "./UpdateWeighIn";

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
      <CustomCalendar
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        dates={extractValuesFromObject(weighInMap)}
      />
      <ConditionalRender condition={!!selectedDate}>
        <View style={[layout.center, spacing.gapMd]}>
          <Text fontSize={16}>{DateUtils.formatDate(selectedDate!, "DD.MM.YYYY")}</Text>
          <View style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}>
            <Text fontSize={16}>
              <ConditionalRender condition={weighInMap[selectedDate!]?.weight}>
                משקל {weighInMap[selectedDate!]?.weight}
              </ConditionalRender>

              <ConditionalRender condition={!weighInMap[selectedDate!]?.weight}>
                אין נתוני שקילה
              </ConditionalRender>
            </Text>

            <UpdateWeighIn
              date={selectedDate || ""}
              weighInToEdit={weighInMap[selectedDate || ""]}
            />
          </View>
        </View>
      </ConditionalRender>
    </View>
  );
};

export default WeighInsCalendar;
