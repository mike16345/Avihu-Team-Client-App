import { View } from "react-native";
import { useState } from "react";
import MuscleGroupSelector from "./MuscleGroupSelector";

import useStyles from "@/styles/useGlobalStyles";
import { MUSCLE_GROUPS, MUSCLE_GROUPS_ENGLISH, muscleImageName } from "@/constants/muscleGroups";

import ExerciseSelector from "./ExerciseSelector";

const WorkoutProgressionHeader = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const [activeMuscleGroup, setActiveMuscleGroup] = useState(MUSCLE_GROUPS[0]);

  return (
    <View>
      <MuscleGroupSelector
        selectedMuscleGroup={activeMuscleGroup}
        onMuscleGroupSelect={(muscle) => setActiveMuscleGroup(muscle)}
      />

      <ExerciseSelector muscleGroup={activeMuscleGroup} />
    </View>
  );
};

export default WorkoutProgressionHeader;
