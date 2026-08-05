import Badge from "@/components/ui/Badge";
import { Text } from "@/components/ui/Text";
import useGetLastRecordedSet from "@/hooks/queries/RecordedSets/useLastRecordedSetQuery";
import { FC } from "react";

interface PreviousSetCardProps {
  exercise: string;
  onPress?: () => void;
}

const PreviousSetCard: FC<PreviousSetCardProps> = ({ exercise, onPress }) => {
  const { formattedSets } = useGetLastRecordedSet(exercise);

  if (formattedSets.length === 0) return null;

  return (
    <Badge buttonLabel="" onPress={onPress} showButton={!!onPress} showDot>
      <Text fontSize={12} fontVariant="semibold">
        עדכון אחרון | {formattedSets[formattedSets.length - 1]}
      </Text>
    </Badge>
  );
};

export default PreviousSetCard;
