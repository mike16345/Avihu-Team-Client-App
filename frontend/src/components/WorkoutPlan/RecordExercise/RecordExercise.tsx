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
import useWorkoutSession from "@/hooks/sessions/useWorkoutSession";
import { getNextSetNumberFromSession } from "@/utils/utils";
import PreviousSetCard from "./PreviousSetCard";
import { LayoutChangeEvent } from "react-native";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import RecordedSetsHistoryModal from "./RecordedSetsHistoryModal";
import useRecordedSetsQuery from "@/hooks/queries/RecordedSets/useRecordedSetsQuery";
import { AddRecordedSets } from "@/hooks/api/useRecordedSetsApi";
import { useTimerStore } from "@/store/timerStore";

interface RecordExerciseProps
  extends StackNavigatorProps<WorkoutPlanStackParamList, "RecordExercise"> {}

const BASE_SPACING = 92;
const METHOD_GAP = 16;

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
  const { exercise, setNumber, muscleGroup, plan } = route?.params! || {};

  const { data } = useRecordedSetsQuery();
  const { useAddRecordedSets: addRecordedSets } = useRecordedSetsMutations();

  const userId = useUserStore((state) => state.currentUser?._id);
  const setCountdown = useTimerStore((state) => state.setCountdown);

  const { layout, colors, spacing } = useStyles();
  const { session, handleSetLocalSession } = useWorkoutSession();
  const { triggerSuccessToast, triggerErrorToast } = useToast();

  const [height, setHeight] = useState(0);
  const [currentSet, setCurrentSet] = useState(setNumber || 1);

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
          sessionId: session?._id,
        });
        const nextSet = getNextSetNumberFromSession(
          response.session,
          plan,
          exercise?.exerciseId.name
        );

        handleSetLocalSession({ ...response.session });
        setCurrentSet(nextSet);
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
    [exercise, setNumber, muscleGroup, plan, session]
  );

  const onLayout = (e: LayoutChangeEvent) => {
    if (e.nativeEvent.layout.height !== height) {
      setHeight(e.nativeEvent.layout.height);
    }
  };

  const hasRecordedSetsHistory = useMemo(() => {
    if (!data || !data.length || !exercise) return false;

    return hasRecordedSets(data, exercise.exerciseId.name);
  }, [data, exercise]);

  const dynamicSpacing = useMemo(() => {
    const hasMethod = Boolean(exercise?.exerciseMethod);
    const extraSpace = hasRecordedSetsHistory ? 0 : METHOD_GAP * 1.5;
    let s = BASE_SPACING + (!hasMethod ? METHOD_GAP : 0) + extraSpace;

    return s;
  }, [exercise?.exerciseMethod, hasRecordedSetsHistory]);

  const sheetHeight = useMemo(
    () => Dimensions.get("screen").height - height - dynamicSpacing,
    [height, dynamicSpacing]
  );

  return (
    <View style={[layout.flex1, colors.background, spacing.gapLg, spacing.pdHorizontalMd]}>
      <RecordExerciseHeader exercise={exercise!} />

      <View style={[layout.flex1, spacing.gapSm]}>
        <View onLayout={onLayout} style={[spacing.gapMd]}>
          <ExerciseVideo exercise={exercise!} />
          <ConditionalRender condition={hasRecordedSetsHistory}>
            <View style={[layout.center, spacing.gap20]}>
              <PreviousSetCard exercise={exercise.exerciseId.name} />
              <RecordedSetsHistoryModal exercise={exercise.exerciseId.name} />
            </View>
          </ConditionalRender>
        </View>
        <View style={{ flex: 1 }} onLayout={onLayout}>
          <SetInputContainer
            sheetHeight={sheetHeight}
            handleRecordSets={handleRecordSets}
            maxSets={exercise?.sets?.length!}
            setNumber={currentSet}
            exercise={exercise}
          />
        </View>
      </View>
    </View>
  );
};

export default RecordExercise;
