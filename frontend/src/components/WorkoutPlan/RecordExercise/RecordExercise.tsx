import useStyles from "@/styles/useGlobalStyles";
import { Dimensions, View } from "react-native";
import RecordExerciseHeader from "./RecordExerciseHeader";
import { FC, useCallback, useMemo, useState } from "react";
import { StackNavigatorProps, WorkoutPlanStackParamList } from "@/types/navigatorTypes";
import ExerciseVideo from "./ExerciseVideo";
import SetInputContainer, { SetInput } from "./SetInputContainer";
import { useRecordedSetsMutations } from "@/hooks/mutations/useRecordedSetsMutations";
import { useUserStore } from "@/store/userStore";
import { IMuscleGroupRecordedSets } from "@/interfaces/Workout";
import { useToast } from "@/hooks/useToast";
import PreviousSetCard from "./PreviousSetCard";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import RecordedSetsHistoryModal from "./RecordedSetsHistoryModal";
import useRecordedSetsQuery from "@/hooks/queries/RecordedSets/useRecordedSetsQuery";
import { AddRecordedSets } from "@/hooks/api/useRecordedSetsApi";
import { useTimerStore } from "@/store/timerStore";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { DEFAULT_PAGE_TOP_PADDING } from "@/constants/Constants";
import { useWorkoutSessionStore } from "@/store/workoutSessionStore";

interface RecordExerciseProps
  extends StackNavigatorProps<WorkoutPlanStackParamList, "RecordExercise"> {}

function hasRecordedSets(data: IMuscleGroupRecordedSets[], exercise: string) {
  for (const muscleGroup of data) {
    const sets = muscleGroup.recordedSets[exercise];

    if (Array.isArray(sets) && sets.length > 0) {
      return true;
    }
  }

  return false;
}

const RecordExercise: FC<RecordExerciseProps> = ({ route }) => {
  const { exercise, muscleGroup, plan } = route?.params! || {};
  const tabBarHeight = useBottomTabBarHeight();

  const { data } = useRecordedSetsQuery();
  const { useAddRecordedSets: addRecordedSets } = useRecordedSetsMutations();

  const userId = useUserStore((state) => state.currentUser?._id);
  const setCountdown = useTimerStore((state) => state.setCountdown);

  const { layout, colors, spacing } = useStyles();
  const { workoutSession, getNextSetNumber, setWorkoutSession } = useWorkoutSessionStore();
  const { triggerSuccessToast, triggerErrorToast } = useToast();

  const [containerHeight, setContainerHeight] = useState(0);
  const [currentSet, setCurrentSet] = useState(() =>
    getNextSetNumber(plan, exercise.exerciseId.name)
  );

  const sheetHeight = useMemo(() => {
    const windowHeight = Dimensions.get("screen").height;
    const buttonHeight = 60;
    const availableHeight =
      windowHeight -
      containerHeight -
      (tabBarHeight + 30) -
      DEFAULT_PAGE_TOP_PADDING -
      buttonHeight;

    return availableHeight;
  }, [containerHeight]);

  const handleRecordSets = useCallback(
    async (sets: SetInput[]) => {
      try {
        const recordedSetsToPost: AddRecordedSets = {
          userId: userId!,
          muscleGroup: muscleGroup!,
          exercise: exercise.exerciseId.name,
          recordedSets: sets.map((set) => {
            return { ...set, plan };
          }),
        };
        const response = await addRecordedSets.mutateAsync({
          recordedSets: recordedSetsToPost,
          sessionId: workoutSession?._id,
        });
        const nextSet = getNextSetNumber(plan, exercise?.exerciseId.name, response.session);

        setCurrentSet(nextSet);
        setWorkoutSession({ ...response.session });
        triggerSuccessToast({
          title: "עודכן בהצלחה",
          message: "הנתונים זמינים לצפייה בהיסטוריית הביצועים",
        });
        setCountdown(exercise.restTime);

        return nextSet;
      } catch (e: any) {
        triggerErrorToast({ message: e.message });
      }
    },
    [exercise, muscleGroup, plan, workoutSession, addRecordedSets, setCountdown, setWorkoutSession]
  );

  const hasRecordedSetsHistory = useMemo(() => {
    if (!data || !data.length || !exercise) return false;

    return hasRecordedSets(data, exercise.exerciseId.name);
  }, [data, exercise]);

  return (
    <View style={[layout.flex1, colors.background, spacing.gapLg, spacing.pdHorizontalMd]}>
      <View
        style={[spacing.gapLg]}
        onLayout={(e) => {
          const { height } = e.nativeEvent.layout;
          setContainerHeight(height);
        }}
      >
        <RecordExerciseHeader exercise={exercise!} />

        <View style={[spacing.gapMd]}>
          <ExerciseVideo exercise={exercise!} />
          <ConditionalRender condition={hasRecordedSetsHistory}>
            <View style={[layout.center, spacing.gap20]}>
              <PreviousSetCard exercise={exercise.exerciseId.name} />
              <RecordedSetsHistoryModal exercise={exercise.exerciseId.name} />
            </View>
          </ConditionalRender>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <SetInputContainer
          sheetHeight={sheetHeight}
          handleRecordSets={handleRecordSets}
          maxSets={exercise?.sets?.length!}
          setNumber={currentSet}
          exercise={exercise}
        />
      </View>
    </View>
  );
};

export default RecordExercise;
