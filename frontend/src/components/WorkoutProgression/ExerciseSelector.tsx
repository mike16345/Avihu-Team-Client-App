import { View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";
import MuscleDisplay from "./MuscleDisplay";
import DropDownTrigger from "../ui/dropwdown/DropDownTrigger";
import DropDownContent from "../ui/dropwdown/DropDownContent";
import { MUSCLE_GROUPS_ENGLISH, MuscleGroup, muscleImageName } from "@/constants/muscleGroups";

interface ExerciseSelectorProps {
  muscleGroup: string;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ muscleGroup }) => {
  const { common, layout, spacing } = useStyles();

  const getMuscleNameInEnglish = (muscleInHebrew: MuscleGroup): muscleImageName =>
    MUSCLE_GROUPS_ENGLISH[muscleInHebrew];

  return (
    <View style={[spacing.gapDefault, spacing.pdHorizontalMd]}>
      <Card variant="gray" style={[common.roundedMd, spacing.pdVertical20, spacing.pdHorizontalMd]}>
        <Card.Header>
          <View style={[layout.flexRow, layout.justifyBetween, spacing.pdHorizontalDefault]}>
            <Text fontVariant="bold" fontSize={20}>
              {muscleGroup}
            </Text>

            <MuscleDisplay
              name={getMuscleNameInEnglish(muscleGroup as MuscleGroup)}
              height={68}
              width={68}
            />
          </View>
        </Card.Header>
        <Card.Content style={{ gap: 6 }}>
          <Text fontSize={16} fontVariant="semibold" style={layout.alignSelfStart}>
            תרגיל
          </Text>
          <DropDownTrigger />
        </Card.Content>
      </Card>

      <DropDownContent />
    </View>
  );
};

export default ExerciseSelector;
