import { View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import ExerciseContainer from "./ExerciseContainer";
import { IMuscleGroupWorkouts } from "@/interfaces/Workout";

interface MuscleGroupContainerProps {
  muscleGroup: IMuscleGroupWorkouts;
}

const MuscleGroupContainer: React.FC<MuscleGroupContainerProps> = ({
  muscleGroup: { exercises, muscleGroup },
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
          key={exercise._id}
          exercise={exercise}
          exerciseCounter={`${i + 1}/${exercises.length}`}
        />
      ))}
    </View>
  );
};

export default MuscleGroupContainer;
