import Badge from "@/components/ui/Badge";
import TipsModal from "@/components/ui/modals/TipsModal";
import { Text } from "@/components/ui/Text";
import useGetLastRecordedSet from "@/hooks/queries/RecordedSets/useLastRecordedSetQuery";
import { IRecordedSetRes } from "@/interfaces/Workout";
import { FC, useEffect, useState } from "react";

interface PreviousSetCardProps {
  exercise: string;
}

export const toLine = (s: IRecordedSetRes) =>
  `סט ${s.setNumber} | משקל ${s.weight} | חזרות ${s.repsDone}`;

const PreviousSetCard: FC<PreviousSetCardProps> = ({ exercise }) => {
  const { formattedSets, date } = useGetLastRecordedSet(exercise);

  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    return () => setIsModalVisible(false);
  }, []);

  return formattedSets.length > 0 ? (
    <>
      <Badge onPress={() => setIsModalVisible(true)} showButton showDot>
        <Text fontSize={12} fontVariant="semibold">
          עדכון אחרון | {formattedSets[formattedSets.length - 1]}
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
        tips={formattedSets}
      />
    </>
  ) : null;
};

export default PreviousSetCard;
