import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";
import RecordExerciseHeader from "./RecordExerciseHeader";
import { FC, useState } from "react";
import { StackNavigatorProps, WorkoutPlanStackParamList } from "@/types/navigatorTypes";
import ExerciseVideo from "./ExerciseVideo";
import { IRecordedSet } from "@/interfaces/Workout";
import SetInputContainer from "./SetInputContainer";

interface RecordExerciseProps
  extends StackNavigatorProps<WorkoutPlanStackParamList, "RecordExercise"> {}

const RecordExercise: FC<RecordExerciseProps> = ({ route }) => {
  const { exercise, setNumber } = route?.params || {};
  const { layout, colors, spacing } = useStyles();

  const [recordedSet, setRecordedSet] = useState<Omit<IRecordedSet, "plan">>({
    repsDone: 0,
    weight: 0,
    setNumber: setNumber || 0,
  });

  const handleUpdateRecordedSet = <K extends keyof IRecordedSet>(
    key: keyof IRecordedSet,
    value: IRecordedSet[K]
  ) => {
    setRecordedSet((prev) => {
      return { ...prev, [key]: value };
    });
  };

  return (
    <View style={[layout.flex1, colors.background, spacing.gap20, spacing.pdHorizontalLg]}>
      <RecordExerciseHeader exercise={exercise!} />

      <View style={[layout.flex1, layout.justifyBetween]}>
        <ExerciseVideo exercise={exercise!} />
        <SetInputContainer
          reps={recordedSet.repsDone}
          weight={recordedSet.weight}
          handleUpdateReps={(reps) => handleUpdateRecordedSet("repsDone", reps)}
          handleUpdateWeight={(weight) => handleUpdateRecordedSet("weight", weight)}
        />
      </View>
    </View>
  );
};

export default RecordExercise;
