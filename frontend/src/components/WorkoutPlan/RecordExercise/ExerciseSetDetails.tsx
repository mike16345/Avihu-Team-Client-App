import { Text } from "@/components/ui/Text";
import { ISet } from "@/interfaces/Workout";
import useColors from "@/styles/useColors";
import useCommonStyles from "@/styles/useCommonStyles";
import { useSpacingStyles } from "@/styles/useSpacingStyles";
import { FC } from "react";
import { View } from "react-native";

interface ExerciseSetDetailsProps {
  sets: ISet[];
  exerciseMethod?: string;
}

const ExerciseSetDetails: FC<ExerciseSetDetailsProps> = ({ sets, exerciseMethod }) => {
  const { backgroundSurface } = useColors();
  const { pdVerticalXs, pdHorizontalMd } = useSpacingStyles();
  const { roundedSm } = useCommonStyles();

  return (
    <View style={[backgroundSurface, pdVerticalXs, pdHorizontalMd, roundedSm]}>
      <Text fontVariant="semibold" fontSize={16}>
        ברירת מחדל: 2 סטים 10 חזרות
      </Text>
    </View>
  );
};

export default ExerciseSetDetails;
