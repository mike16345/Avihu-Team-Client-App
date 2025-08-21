import { View, ScrollView } from "react-native";
import React from "react";
import { MUSCLE_GROUPS } from "@/constants/muscleGroups";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import { Text } from "../ui/Text";

interface MuscleGroupSelectorProps {
  selectedMuscleGroup: string;
  onMuscleGroupSelect: (muscleGroup: string) => void;
}

const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({
  selectedMuscleGroup,
  onMuscleGroupSelect,
}) => {
  const { colors, spacing, layout } = useStyles();

  return (
    <View>
      <ScrollView
        horizontal
        contentContainerStyle={[spacing.gapDefault, layout.alignSelfStart]}
        nestedScrollEnabled
      >
        {MUSCLE_GROUPS.map((muscle, i) => {
          const isActive = muscle === selectedMuscleGroup;

          return (
            <PrimaryButton
              key={i}
              mode={isActive ? "dark" : "light"}
              onPress={() => onMuscleGroupSelect(muscle)}
              style={spacing.pdVerticalSm}
            >
              <View style={[spacing.pdHorizontalDefault]}>
                <Text style={isActive ? colors.textOnPrimary : colors.textPrimary}>{muscle}</Text>
              </View>
            </PrimaryButton>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default MuscleGroupSelector;
