import Badge from "@/components/ui/Badge";
import { Text } from "@/components/ui/Text";
import useRecordedSetsQuery from "@/hooks/queries/RecordedSets/useRecordedSetsQuery";
import { FC, useMemo } from "react";

interface PreviousSetCardProps {
  exercise: string;
}

const PreviousSetCard: FC<PreviousSetCardProps> = ({ exercise }) => {
  const { data } = useRecordedSetsQuery();

  const details = useMemo(() => {
    if (!data || !data.length) return "";
    let result = "";

    data.forEach((item) => {
      const keys = Object.keys(item.recordedSets);
      const key = keys.find((k) => k === exercise);

      if (!key) return result;
      const sets = item.recordedSets[key];

      if (sets && sets.length > 0) {
        const latestSet = sets.reduce((prev, current) =>
          prev.date && current.date && new Date(prev.date) > new Date(current.date) ? prev : current
        );
        result = `סט ${latestSet.setNumber} | משקל ${latestSet.weight} | חזרות ${latestSet.repsDone}  `;
        return;
      }
    });

    return result;
  }, [data, exercise]);

  return details ? (
    <Badge showButton showDot>
      <Text fontVariant="semibold">עדכון אחרון | {details}</Text>
    </Badge>
  ) : null;
};

export default PreviousSetCard;
