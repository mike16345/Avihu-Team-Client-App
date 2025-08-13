import { Image, TouchableOpacity, View } from "react-native";
import React from "react";
import { Card } from "@/components/ui/Card";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import { IExercise } from "@/interfaces/Workout";

interface ExerciseContainerProps {
  exercise: IExercise;
  exerciseCounter: string;
}

const ExerciseContainer: React.FC<ExerciseContainerProps> = ({
  exercise: { exerciseId },
  exerciseCounter,
}) => {
  const { common, layout, spacing, text } = useStyles();

  return (
    <TouchableOpacity>
      <Card variant="gray">
        <View style={[layout.flexRow, layout.justifyBetween]}>
          <View style={[spacing.gapXl]}>
            <Text>{exerciseId.name}</Text>
            <Text style={[layout.alignSelfStart, text.textBold]}>{exerciseCounter}</Text>
          </View>

          <Image
            source={{
              uri: "https://www.mensfitness.com/.image/w_1080,q_auto:good,c_fill,ar_4:3/MjEyMTg3NTY0NjM3OTU1NzEy/chest-workout-home.jpg",
            }}
            height={66}
            width={72}
            style={[common.rounded]}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default ExerciseContainer;
