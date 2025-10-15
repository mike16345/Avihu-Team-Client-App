import { View, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Icon from "@/components/Icon/Icon";
import { FC, useCallback, useState } from "react";
import BottomSheetModal from "@/components/ui/modals/BottomSheetModal";
import Animated, { Easing, LinearTransition } from "react-native-reanimated";
import { IExercise, IRecordedSet } from "@/interfaces/Workout";
import SetInputList from "./SetInputList";
import PreviousSetCard from "./PreviousSetCard";
import useGetLastRecordedSet from "@/hooks/queries/RecordedSets/useLastRecordedSetQuery";
import { isIndexOutOfBounds } from "@/utils/utils";
import { DEFAULT_SET } from "@/constants/Constants";

const HORIZONTAL_PADDING = 24;
const VERTICAL_PADDING = 16;

interface SetInputContainerProps {
  sheetHeight: number;
  setNumber: number;
  maxSets: number;
  exercise: IExercise;
  handleRecordSets: (sets: SetInput[]) => Promise<number>;
}

export type SetInput = Omit<IRecordedSet, "plan">;

const SetInputContainer: FC<SetInputContainerProps> = ({
  handleRecordSets,
  maxSets,
  setNumber,
  sheetHeight,
  exercise,
}) => {
  const lastRecordedSets = useGetLastRecordedSet(exercise.exerciseId.name).lastRecordedSets;

  const { layout, colors, spacing, common } = useStyles();

  const [isExpanded, setIsExpanded] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [recordedSets, setRecordedSets] = useState<SetInput[]>(() => {
    const defaultSet = lastRecordedSets[lastRecordedSets.length - 1] ?? DEFAULT_SET;
    return [
      {
        ...defaultSet,
        setNumber,
      },
    ];
  });

  const handleCloseModal = () => {
    setIsExpanded(false);
    setRecordedSets((prev) => prev.slice(0, 1));
  };

  const handleSubmitSets = async () => {
    setIsPending(true);
    const nextSet = await handleConfirmRecordSets();

    setIsPending(false);
    handleResetSets(nextSet, recordedSets[recordedSets.length - 1]?.weight || 0);
  };

  const handleResetSets = useCallback((nextSet: number, prevWeight: number) => {
    if (!nextSet) return;

    const isOutOfBounds = isIndexOutOfBounds(exercise.sets, nextSet);
    const reps = isOutOfBounds
      ? exercise.sets[exercise.sets.length - 1].minReps
      : exercise.sets[nextSet].minReps;

    setRecordedSets([{ repsDone: reps, weight: prevWeight, setNumber: nextSet }]);
  }, []);

  const handleConfirmRecordSets = useCallback(async () => {
    return await handleRecordSets(recordedSets);
  }, [recordedSets, handleRecordSets]);

  return (
    <>
      <BottomSheetModal
        peek={useWindowDimensions().height * 0.5}
        onOpenChange={(isExpanded) => setIsExpanded(isExpanded)}
        visible={isExpanded}
        renderHandle={({ toggle, isOpen }) => (
          <Pressable onPress={toggle}>
            <Icon rotation={isOpen ? 180 : 0} name={"arrowRoundUp"} />
          </Pressable>
        )}
        onClose={handleCloseModal}
        onLayout={(e) => {
          if (e.nativeEvent.layout.height !== containerHeight)
            setContainerHeight(e.nativeEvent.layout.height);
        }}
      >
        <View
          style={[
            layout.flex1,
            isExpanded ? layout.justifyBetween : spacing.gapLg,
            common.roundedMd,
            colors.backgroundSurface,
            styles.inputContainer,
          ]}
        >
          <SetInputList
            recordedSets={recordedSets}
            setRecordedSets={setRecordedSets}
            maxSets={maxSets}
            containerHeight={containerHeight}
            isExpanded={isExpanded}
          />
          <Animated.View
            style={[spacing.gapDefault]}
            layout={LinearTransition.duration(250).easing(Easing.inOut(Easing.ease))}
          >
            {isExpanded && <PreviousSetCard exercise={exercise.exerciseId.name} />}
            <PrimaryButton
              disabled={recordedSets[recordedSets.length - 1].setNumber > maxSets}
              loading={isPending}
              onPress={() => handleSubmitSets()}
              block
            >
              עדכון
            </PrimaryButton>
          </Animated.View>
        </View>
      </BottomSheetModal>
    </>
  );
};

export default SetInputContainer;

const styles = StyleSheet.create({
  inputContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: VERTICAL_PADDING,
  },
});
