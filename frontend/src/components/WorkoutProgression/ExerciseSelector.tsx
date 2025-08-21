import { View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";
import MuscleDisplay from "./MuscleDisplay";
import DropDownTrigger from "../ui/dropwdown/DropDownTrigger";
import DropDownContent from "../ui/dropwdown/DropDownContent";
import { MUSCLE_GROUPS_ENGLISH, muscleImageName } from "@/constants/muscleGroups";

interface ExerciseSelectorProps {
  muscleGroup: string;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ muscleGroup }) => {
  const { common, fonts, layout, spacing } = useStyles();

  const getMuscleNameInEnglish = (muscleInHebrew: string): muscleImageName =>
    MUSCLE_GROUPS_ENGLISH[muscleInHebrew];

  return (
    <View style={spacing.gapDefault}>
      <Card variant="gray" style={[spacing.gap20, common.roundedMd]}>
        <Card.Header>
          <View style={[layout.flexRow, layout.justifyBetween, spacing.pdHorizontalDefault]}>
            <Text fontVariant="bold" style={[fonts.lg]}>
              {muscleGroup}
            </Text>

            <MuscleDisplay name={getMuscleNameInEnglish(muscleGroup)} height={80} width={80} />
          </View>
        </Card.Header>
        <Card.Content>
          <DropDownTrigger />
        </Card.Content>
      </Card>

      <DropDownContent />
    </View>
  );
};

export default ExerciseSelector;
