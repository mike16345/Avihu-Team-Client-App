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
import { useWorkoutSessionStore } from "@/store/workoutSessionStore";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { DEFAULT_PAGE_TOP_PADDING } from "@/constants/Constants";

interface RecordExerciseProps extends StackNavigatorProps<
  WorkoutPlanStackParamList,
  "RecordExercise"
> {}

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
  const {
    useAddRecordedSets: addRecordedSets,
    useUpdateRecordedSet: updateRecordedSet,
    useDeleteRecordedSet: deleteRecordedSet,
  } = useRecordedSetsMutations();

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
    return (
      windowHeight - containerHeight - (tabBarHeight + 30) - DEFAULT_PAGE_TOP_PADDING - buttonHeight
    );
  }, [containerHeight, tabBarHeight]);

  const postRecordedSets = useCallback(
    async (sets: SetInput[]) => {
      const recordedSetsToPost: AddRecordedSets = {
        userId: userId!,
        muscleGroup: muscleGroup!,
        exercise: exercise.exerciseId.name,
        recordedSets: sets.map((set) => ({ ...set, plan })),
      };
      const response = await addRecordedSets.mutateAsync({
        recordedSets: recordedSetsToPost,
        sessionId: workoutSession?._id,
      });
      setWorkoutSession({ ...response.session });
      setCountdown(exercise.restTime);
      return response;
    },
    [
      exercise,
      muscleGroup,
      plan,
      userId,
      workoutSession,
      addRecordedSets,
      setCountdown,
      setWorkoutSession,
    ]
  );

  const handleRecordSets = useCallback(
    async (sets: SetInput[]) => {
      try {
        const response = await postRecordedSets(sets);
        const savedSetId = (response.recordedSet as unknown as { _id?: string })?._id;
        triggerSuccessToast({
          title: "עודכן בהצלחה",
          message: "הנתונים זמינים לצפייה בהיסטוריית הביצועים",
        });
        return savedSetId;
      } catch (e) {
        triggerErrorToast({ message: e instanceof Error ? e.message : "שגיאה" });
        return undefined;
      }
    },
    [postRecordedSets, triggerSuccessToast, triggerErrorToast]
  );

  const handleRecordSetsWheel = useCallback(
    async (sets: SetInput[]) => {
      try {
        const response = await postRecordedSets(sets);
        const nextSet = getNextSetNumber(plan, exercise.exerciseId.name, response.session);
        setCurrentSet(nextSet);
        triggerSuccessToast({
          title: "עודכן בהצלחה",
          message: "הנתונים זמינים לצפייה בהיסטוריית הביצועים",
        });
        return nextSet;
      } catch (e) {
        triggerErrorToast({ message: e instanceof Error ? e.message : "שגיאה" });
        return undefined;
      }
    },
    [postRecordedSets, plan, exercise, getNextSetNumber, triggerSuccessToast, triggerErrorToast]
  );

  const handleUpdateSet = useCallback(
    async (setId: string, set: SetInput) => {
      try {
        await updateRecordedSet.mutateAsync({
          set,
          id: setId,
          exercise: exercise.exerciseId.name,
        });
        triggerSuccessToast({
          title: "עודכן בהצלחה",
          message: "הסט עודכן בהיסטוריה",
        });
        return { setId };
      } catch (e) {
        triggerErrorToast({ message: e instanceof Error ? e.message : "שגיאה" });
        return undefined;
      }
    },
    [exercise, updateRecordedSet, triggerSuccessToast, triggerErrorToast]
  );

  const handleDeleteSet = useCallback(
    async (setId: string) => {
      if (!userId) return false;
      try {
        await deleteRecordedSet.mutateAsync({
          setId,
          userId,
          exercise: exercise.exerciseId.name,
          muscleGroup: muscleGroup!,
        });
        triggerSuccessToast({
          title: "נמחק בהצלחה",
          message: "הסט נמחק מההיסטוריה",
        });
        return true;
      } catch (e) {
        triggerErrorToast({ message: e instanceof Error ? e.message : "שגיאה" });
        return false;
      }
    },
    [userId, muscleGroup, exercise, deleteRecordedSet, triggerSuccessToast, triggerErrorToast]
  );

  const hasRecordedSetsHistory = useMemo(() => {
    if (!data || !data.length || !exercise) return false;

    return hasRecordedSets(data, exercise.exerciseId.name);
  }, [data, exercise]);

  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const openHistory = () => setIsHistoryVisible(true);
  const closeHistory = () => setIsHistoryVisible(false);

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
              <PreviousSetCard exercise={exercise.exerciseId.name} onPress={openHistory} />
              <RecordedSetsHistoryModal
                exercise={exercise.exerciseId.name}
                visible={isHistoryVisible}
                onDismiss={closeHistory}
              />
            </View>
          </ConditionalRender>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <SetInputContainer
          handleRecordSets={handleRecordSets}
          handleRecordSetsWheel={handleRecordSetsWheel}
          handleUpdateSet={handleUpdateSet}
          handleDeleteSet={handleDeleteSet}
          maxSets={exercise?.sets?.length!}
          exercise={exercise}
          sheetHeight={sheetHeight}
          setNumber={currentSet}
        />
      </View>
    </View>
  );
};

export default RecordExercise;
