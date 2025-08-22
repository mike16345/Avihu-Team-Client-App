import { Dimensions, TouchableOpacity, useWindowDimensions, View } from "react-native";
import CustomCalendar from "./CustomCalendar";
import { useMemo, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ui/ConditionalRender";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import DateUtils from "@/utils/dateUtils";
import { Text } from "../ui/Text";
import Icon from "../Icon/Icon";
import { CustomModal } from "../ui/modals/Modal";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import Input from "../ui/inputs/Input";

const WeighInsCalendar = () => {
  const { width } = useWindowDimensions();
  const { data } = useWeighInsQuery();
  const { spacing, layout } = useStyles();

  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
        <View style={[layout.center, spacing.gapMd]}>
          <Text fontSize={16}>{DateUtils.formatDate(selectedDate!, "DD.MM.YYYY")}</Text>
          <View style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}>
            <Text fontSize={16}>משקל {weighInMap[selectedDate!]}</Text>
            <TouchableOpacity onPress={() => setIsEditModalOpen(true)}>
              <Icon name="pencil" />
            </TouchableOpacity>
          </View>
        </View>
      </ConditionalRender>

      <CustomModal visible={isEditModalOpen}>
        <CustomModal.Content>
          <View style={[layout.widthFull, layout.center, spacing.gapMd]}>
            <Text fontSize={16}>{DateUtils.formatDate(selectedDate!, "DD.MM.YYYY")}</Text>

            <Text fontSize={16}>משקל_</Text>
            <View style={[spacing.gapLg, layout.center]}>
              <Input label="משקל" style={[{ width: width * 0.75 }]} placeholder="הכנס משקל" />
              <View style={[spacing.gapMd, { width: width * 0.5 }]}>
                <PrimaryButton onPress={() => console.log("update weigh in")} block>
                  עדכון
                </PrimaryButton>
                <PrimaryButton onPress={() => setIsEditModalOpen(false)} mode="light" block>
                  ביטול
                </PrimaryButton>
              </View>
            </View>
            <TouchableOpacity onPress={() => console.log("delete weigh in")}>
              <Icon name="trash" />
            </TouchableOpacity>
          </View>
        </CustomModal.Content>
      </CustomModal>
    </View>
  );
};

export default WeighInsCalendar;
