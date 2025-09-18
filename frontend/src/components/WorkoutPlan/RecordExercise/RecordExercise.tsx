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

  console.log("exercise", exercise?.sets.length);

  return (
    <View style={[layout.flex1, colors.background, spacing.gap20, spacing.pdHorizontalMd]}>
      <RecordExerciseHeader exercise={exercise!} />

      <View style={[layout.flex1, layout.justifyBetween]}>
        <ExerciseVideo exercise={exercise!} />
        <SetInputContainer maxSets={exercise?.sets?.length!} setNumber={setNumber || 1} />
      </View>
    </View>
  );
};

export default RecordExercise;
