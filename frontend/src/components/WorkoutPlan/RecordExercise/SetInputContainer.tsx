import { View, Pressable, StyleSheet, StatusBar } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Icon from "@/components/Icon/Icon";
import { FC, useCallback, useState } from "react";
import Animated, { Easing, LinearTransition } from "react-native-reanimated";
import { IExercise, IRecordedSet } from "@/interfaces/Workout";
import SetInputList from "./SetInputList";
import PreviousSetCard from "./PreviousSetCard";
import useGetLastRecordedSet from "@/hooks/queries/RecordedSets/useLastRecordedSetQuery";
import { isIndexOutOfBounds } from "@/utils/utils";
import {
  DEFAULT_PAGE_TOP_PADDING,
  DEFAULT_SET,
  IS_IOS,
  RECORD_SET_SHEET_MAX_PEEK_HEIGHT,
  TOP_BAR_HEIGHT,
} from "@/constants/Constants";
import { useLayoutStore } from "@/store/layoutStore";
import FixedRangeBottomDrawer from "@/components/ui/BottomDrawerModal";

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
  const setIsSheetExpanded = useLayoutStore((state) => state.setIsSheetExpanded);
  const topoffset = IS_IOS
    ? TOP_BAR_HEIGHT
    : (StatusBar.currentHeight || TOP_BAR_HEIGHT) + DEFAULT_PAGE_TOP_PADDING + 30;

  const [isExpanded, setIsExpanded] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [recordedSets, setRecordedSets] = useState<SetInput[]>(() => {
    const defaultSet = lastRecordedSets[lastRecordedSets.length - 1] ?? DEFAULT_SET;

    return [
      {
        repsDone: defaultSet.repsDone,
        weight: defaultSet.weight,
        setNumber,
      },
    ];
  });

  const handleStateChange = (isExpanded: boolean) => {
    setIsExpanded(isExpanded);
    setIsSheetExpanded(isExpanded);
    if (!isExpanded) {
      setRecordedSets((prev) => prev.slice(0, 1));
    }
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
      {/* <BottomSheetModal
        peek={IS_IOS ? height * 0.5 : sheetHeight}
        onOpenChange={(isExpanded) => {
          setIsExpanded(isExpanded);
          setIsSheetExpanded(isExpanded);
        }}
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
            { overflow: "hidden" },
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
            style={[spacing.gapLg]}
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
      </BottomSheetModal> */}
      <FixedRangeBottomDrawer
        onStateChange={handleStateChange}
        minHeight={
          IS_IOS || sheetHeight > RECORD_SET_SHEET_MAX_PEEK_HEIGHT
            ? RECORD_SET_SHEET_MAX_PEEK_HEIGHT
            : sheetHeight
        }
        topOffset={topoffset}
        renderHandle={({ toggle, isOpen }) => (
          <Pressable onPress={toggle}>
            <Icon rotation={isOpen ? 180 : 0} name={"arrowRoundUp"} />
          </Pressable>
        )}
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
            { overflow: "hidden" },
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
            style={[spacing.gapLg]}
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
      </FixedRangeBottomDrawer>
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
