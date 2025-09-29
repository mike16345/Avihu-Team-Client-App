import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";
import RecordExerciseHeader from "./RecordExerciseHeader";
import { FC, useCallback, useState } from "react";
import { StackNavigatorProps, WorkoutPlanStackParamList } from "@/types/navigatorTypes";
import ExerciseVideo from "./ExerciseVideo";
import SetInputContainer, { SetInput } from "./SetInputContainer";
import { useRecordedSetsMutations } from "@/hooks/mutations/useRecordedSetsMutations";
import { useUserStore } from "@/store/userStore";
import { IRecordedSetPost } from "@/interfaces/Workout";
import { useToast } from "@/hooks/useToast";
import useWorkoutSession from "@/hooks/sessions/useWorkoutSession";
import { getNextSetNumberFromSession } from "@/utils/utils";

interface RecordExerciseProps
  extends StackNavigatorProps<WorkoutPlanStackParamList, "RecordExercise"> {}

const RecordExercise: FC<RecordExerciseProps> = ({ route }) => {
  const { layout, colors, spacing } = useStyles();
  const userId = useUserStore((state) => state.currentUser?._id);
  const { handleSetLocalSession } = useWorkoutSession();

  const { exercise, setNumber, muscleGroup, plan } = route?.params! || {};

  const { useAddRecordedSets: addRecordedSets } = useRecordedSetsMutations();
  const { triggerSuccessToast, triggerErrorToast } = useToast();

  const [currentSet, setCurrentSet] = useState(setNumber || 1);

  const handleRecordSets = useCallback(
    async (sets: SetInput[]) => {
      try {
        const recordedSets: IRecordedSetPost = {
          userId: userId!,
          recordedSet: { ...sets[0], plan: plan! },
          muscleGroup: muscleGroup!,
          exercise: exercise?.exerciseId.name!,
        };

        const response = await addRecordedSets.mutateAsync(recordedSets);
        const nextSet = getNextSetNumberFromSession(
          response.session,
          plan,
          exercise?.exerciseId.name
        );

        handleSetLocalSession(response.session);
        setCurrentSet(nextSet);
        triggerSuccessToast({ message: "ניתן להיות במעקב אימונים" });
      } catch (e: any) {
        triggerErrorToast({ message: e.message });
      }
    },
    [exercise, setNumber, muscleGroup, plan]
  );

  return (
    <View style={[layout.flex1, colors.background, spacing.gap20, spacing.pdHorizontalMd]}>
      <RecordExerciseHeader exercise={exercise!} />

      <View style={[layout.flex1, layout.justifyBetween]}>
        <ExerciseVideo exercise={exercise!} />
        <SetInputContainer
          handleRecordSets={handleRecordSets}
          maxSets={exercise?.sets?.length!}
          setNumber={currentSet}
        />
      </View>
    </View>
  );
};

export default RecordExercise;
