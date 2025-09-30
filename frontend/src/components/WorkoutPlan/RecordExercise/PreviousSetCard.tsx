import Badge from "@/components/ui/Badge";
import TipsModal from "@/components/ui/modals/TipsModal";
import { Text } from "@/components/ui/Text";
import useRecordedSetsQuery from "@/hooks/queries/RecordedSets/useRecordedSetsQuery";
import { IRecordedSet } from "@/interfaces/Workout";
import DateUtils from "@/utils/dateUtils";
import { FC, useEffect, useMemo, useState } from "react";

interface PreviousSetCardProps {
  exercise: string;
}

const PreviousSetCard: FC<PreviousSetCardProps> = ({ exercise }) => {
  const { data } = useRecordedSetsQuery();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const { details, lastRecordedSets, date } = useMemo(() => {
    if (!data || !data.length) return { details: "", lastRecordedSets: [], date: null };

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    let latestSet: IRecordedSet | undefined;

    data.forEach((item) => {
      const sets = item?.recordedSets?.[exercise];
      if (!Array.isArray(sets)) return;

      sets.forEach((s) => {
        const d = new Date(s.date!);
        if (!latestSet || (latestSet.date && d > new Date(latestSet.date))) {
          latestSet = s;
        }
      });
    });

    if (!latestSet?.date) return { details: "", lastRecordedSets: [], date: null };

    const latestDay = new Date(latestSet.date);
    const sameDaySets: IRecordedSet[] = [];

    data.forEach((item) => {
      const sets = item?.recordedSets?.[exercise];
      if (!Array.isArray(sets)) return;

      sets.forEach((s) => {
        if (isSameDay(new Date(s.date!), latestDay)) {
          sameDaySets.push(s);
        }
      });
    });

    sameDaySets.sort((a, b) => (a?.setNumber ?? 0) - (b?.setNumber ?? 0));

    const toLine = (s: NonNullable<typeof latestSet>) =>
      `סט ${s.setNumber} | משקל ${s.weight} | חזרות ${s.repsDone}`;

    const details = toLine(latestSet); // latest set summary (kept for your Badge)
    const lastRecordedSets = sameDaySets.map(toLine);
    const date = DateUtils.formatDate(latestDay, "DD.MM.YY");

    return { details, lastRecordedSets, date };
  }, [data, exercise]);

  useEffect(() => {
    return () => setIsModalVisible(false);
  }, []);

  return details ? (
    <>
      <Badge onPress={() => setIsModalVisible(true)} showButton showDot>
        <Text fontSize={12} fontVariant="semibold">
          עדכון אחרון | {details}
        </Text>
      </Badge>
      <TipsModal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        title={
          <Text fontSize={16} fontVariant="light">
            עדכון אחרון {date}
          </Text>
        }
        tips={lastRecordedSets}
      />
    </>
  ) : null;
};

export default PreviousSetCard;
