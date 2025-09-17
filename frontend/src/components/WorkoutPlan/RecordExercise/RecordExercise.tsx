import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";
import RecordExerciseHeader from "./RecordExerciseHeader";
import { FC } from "react";
import { StackNavigatorProps, WorkoutPlanStackParamList } from "@/types/navigatorTypes";
import ExerciseVideo from "./ExerciseVideo";

interface RecordExerciseProps
  extends StackNavigatorProps<WorkoutPlanStackParamList, "RecordExercise"> {}

const RecordExercise: FC<RecordExerciseProps> = ({ route }) => {
  const { exercise, muscleGroup, setNumber } = route?.params || {};
  const { layout, colors, spacing } = useStyles();

  return (
    <View style={[layout.flex1, colors.background, spacing.gap20]}>
      <RecordExerciseHeader exercise={exercise} />

      <ExerciseVideo exercise={exercise} />
    </View>
  );
};

export default RecordExercise;
