import CustomCalendar from "@/components/Calendar/CustomCalendar";
import { CustomModal } from "@/components/ui/modals/Modal";
import { Text } from "@/components/ui/Text";
import useRecordedSetsQuery from "@/hooks/queries/RecordedSets/useRecordedSetsQuery";
import { IRecordedSetRes } from "@/interfaces/Workout";
import { FC, useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import PreviousSetCard, { toLine } from "./PreviousSetCard";
import useStyles from "@/styles/useGlobalStyles";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";
import DateUtils from "@/utils/dateUtils";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import UpdateSetModal from "./UpdateSetModal";

interface RecordedSetsHistoryModalProps {
  exercise: string;
}

const RecordedSetsHistoryModal: FC<RecordedSetsHistoryModalProps> = ({ exercise }) => {
  const { layout, spacing } = useStyles();
  const { data } = useRecordedSetsQuery();

  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>();

  const { markedDates, setsByDate } = useMemo(() => {
    const byDate: Record<string, IRecordedSetRes[]> = {};
    const marked = new Set<string>();

    if (!data || data.length === 0) {
      return { markedDates: [] as string[], setsByDate: byDate };
    }

    for (const item of data) {
      const sets = item.recordedSets[exercise] || [];

      for (const s of sets) {
        const d = s?.date;
        if (!d) continue;
        const formatted = DateUtils.formatDate(d, "YYYY-MM-DD");

        marked.add(formatted);
        if (!byDate[formatted]) byDate[formatted] = [];
        byDate[formatted].push(s);
      }
    }

    return { markedDates: Array.from(marked), setsByDate: byDate };
  }, [data, exercise]);

  const sets: IRecordedSetRes[] = useMemo(() => {
    if (!selectedDate) return [];

    return setsByDate[selectedDate] ?? [];
  }, [selectedDate, setsByDate]);

  useEffect(() => {
    setSelectedDate(DateUtils.formatDate(new Date(), "YYYY-MM-DD"));
    // return () => setIsVisible(false);
  }, []);

  return (
    <>
      <SecondaryButton
        alignStart={false}
        onPress={() => setIsVisible(true)}
        rightIcon="documentText"
      >
        היסטוריית משקל וחזרות
      </SecondaryButton>
      <CustomModal visible={isVisible} onDismiss={() => setIsVisible(false)}>
        <CustomModal.Header>
          <Text fontSize={16} fontVariant="light">
            היסטוריית משקל וחזרות
          </Text>
        </CustomModal.Header>
        <CustomModal.Content style={[layout.flex1, layout.justifyBetween]}>
          <View style={[spacing.gapMd]}>
            <CustomCalendar
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              dates={markedDates}
            />
            <ConditionalRender condition={!!selectedDate}>
              <View style={[spacing.gapMd, layout.center]}>
                <Text fontSize={16}>{DateUtils.formatDate(selectedDate!, "DD.MM.YY")}</Text>

                <ScrollView style={{ maxHeight: 200 }} contentContainerStyle={[spacing.gapDefault]}>
                  {sets.map((set, index) => (
                    <View
                      key={set._id ?? index}
                      style={[layout.flexRow, layout.itemsCenter, spacing.gapLg]}
                    >
                      <Text fontSize={16}>{toLine(set)}</Text>
                      <UpdateSetModal set={set} exercise={exercise}/>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </ConditionalRender>
          </View>
          <PreviousSetCard exercise={exercise} />
        </CustomModal.Content>
      </CustomModal>
    </>
  );
};

export default RecordedSetsHistoryModal;
