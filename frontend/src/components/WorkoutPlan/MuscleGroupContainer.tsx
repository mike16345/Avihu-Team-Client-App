import { View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import ExerciseContainer from "./ExerciseContainer";
import { IMuscleGroupWorkouts } from "@/interfaces/Workout";

interface MuscleGroupContainerProps {
  muscleGroup: IMuscleGroupWorkouts;
  plan: string;
}

const MuscleGroupContainer: React.FC<MuscleGroupContainerProps> = ({
  muscleGroup: { exercises, muscleGroup },
  plan,
}) => {
  const { colors, common, layout, spacing } = useStyles();

  return (
    <View style={spacing.gapMd}>
      <View
        style={[colors.backgroundSurface, common.rounded, spacing.pdDefault, layout.alignSelfStart]}
      >
        <Text fontVariant="bold">{muscleGroup}</Text>
      </View>

      {exercises.map((exercise, i) => (
        <ExerciseContainer
          key={exercise._id || i}
          exercise={exercise}
          plan={plan}
          muscleGroup={muscleGroup}
        />
      ))}
    </View>
  );
};

export default MuscleGroupContainer;
