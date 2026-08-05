import CustomCalendar from "@/components/Calendar/CustomCalendar";
import { CustomModal } from "@/components/ui/modals/Modal";
import { Text } from "@/components/ui/Text";
import useRecordedSetsQuery from "@/hooks/queries/RecordedSets/useRecordedSetsQuery";
import { IRecordedSetRes } from "@/interfaces/Workout";
import { FC, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import PreviousSetCard from "./PreviousSetCard";
import useStyles from "@/styles/useGlobalStyles";
import DateUtils from "@/utils/dateUtils";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import UpdateSetModal from "./UpdateSetModal";
import { hasRecordedSetRir } from "@/utils/recordedSets";

interface RecordedSetsHistoryModalProps {
  exercise: string;
  visible: boolean;
  onDismiss: () => void;
}

const formatHistorySetLine = (set: IRecordedSetRes) => {
  const base = `סט ${set.setNumber} | משקל ${set.weight} | חזרות ${set.repsDone}`;

  return hasRecordedSetRir(set) ? `${base} | רזרבה ${set.rir}` : base;
};

const RecordedSetsHistoryModal: FC<RecordedSetsHistoryModalProps> = ({
  exercise,
  visible,
  onDismiss,
}) => {
  const { layout, spacing } = useStyles();
  const { data } = useRecordedSetsQuery();

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
  }, []);

  return (
    <CustomModal visible={visible} onDismiss={onDismiss}>
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
            <View style={[spacing.gapMd, layout.center, layout.widthFull]}>
              <Text fontSize={16}>{DateUtils.formatDate(selectedDate!, "DD.MM.YY")}</Text>

              <ScrollView
                style={styles.historyScroll}
                contentContainerStyle={[spacing.gapDefault, styles.historyList]}
                showsVerticalScrollIndicator={false}
              >
                {sets.map((set, index) => (
                  <View key={set._id ?? index} style={styles.historyRow}>
                    <Text
                      adjustsFontSizeToFit
                      minimumFontScale={0.82}
                      numberOfLines={1}
                      fontSize={14}
                    >
                      {formatHistorySetLine(set)}
                    </Text>
                    <UpdateSetModal set={set} exercise={exercise} />
                  </View>
                ))}
              </ScrollView>
            </View>
          </ConditionalRender>
        </View>
        <PreviousSetCard exercise={exercise} />
      </CustomModal.Content>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  historyScroll: {
    width: "100%",
    maxHeight: 200,
  },
  historyList: {
    width: "100%",
    alignItems: "stretch",
    paddingHorizontal: 2,
  },
  historyRow: {
    width: "100%",
    "flexDirection":"row",
    minHeight: 34,
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  historyTextContainer: {
    width: "100%",
    paddingStart: 36,
    paddingEnd: 10,
  },
  historyLine: {
    maxWidth: "100%",
    textAlign: "right",
    writingDirection: "rtl",
  },
  editAction: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingStart: 10,
  },
});

export default RecordedSetsHistoryModal;
