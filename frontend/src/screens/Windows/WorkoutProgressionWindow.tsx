import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import MuscleDisplay from "@/components/WorkoutProgression/MuscleDisplay";
import MuscleGroupSelector from "@/components/WorkoutProgression/MuscleGroupSelector";
import { MUSCLE_GROUPS } from "@/constants/muscleGroups";
import useStyles from "@/styles/useGlobalStyles";
import { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";

const WorkoutProgressionWindow = () => {
  const { layout, colors, common, fonts, spacing, text } = useStyles();

  const [activeMuscleGroup, setActiveMuscleGroup] = useState(MUSCLE_GROUPS[0]);

  return (
    <ScrollView contentContainerStyle={[spacing.gapDefault, layout.flex1, spacing.pdDefault]}>
      <MuscleGroupSelector
        selectedMuscleGroup={activeMuscleGroup}
        onMuscleGroupSelect={(muscle) => setActiveMuscleGroup(muscle)}
      />

      <Card variant="gray">
        <Card.Header>
          <View style={[layout.flexRow, layout.justifyBetween]}>
            <Text fontVariant="bold" style={[fonts.lg]}>
              {activeMuscleGroup}
            </Text>

            <MuscleDisplay />
          </View>
        </Card.Header>
      </Card>
    </ScrollView>
  );
};

export default WorkoutProgressionWindow;
