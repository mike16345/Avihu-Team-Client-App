import { Image, Platform, Pressable, TextInput, View } from "react-native";
import React from "react";
import { Card } from "@/components/ui/Card";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import { IExercise } from "@/interfaces/Workout";
import { buildPhotoUrl, extractVideoId, getYouTubeThumbnail } from "@/utils/utils";
import { useNavigation } from "@react-navigation/native";
import { WorkoutStackParamListNavigationProp } from "@/types/navigatorTypes";

interface ExerciseContainerProps {
  exercise: IExercise;
  setCounter: string;
  muscleGroup: string;
}

const ExerciseContainer: React.FC<ExerciseContainerProps> = ({
  exercise,
  setCounter,
  muscleGroup,
}) => {
  const { common, layout, spacing } = useStyles();
  const { exerciseId } = exercise;
  const { navigate } = useNavigation<WorkoutStackParamListNavigationProp>();

  const getExerciseImage = () => {
    return exerciseId.imageUrl
      ? buildPhotoUrl(exerciseId.imageUrl)
      : getYouTubeThumbnail(extractVideoId(exerciseId.linkToVideo));
  };

  const handleOpenExercise = () => {
    navigate("RecordExercise", { exercise, muscleGroup, setNumber: 1 });
  };

  const pressedOpacity = Platform.OS == "ios" ? 0.5 : 0.8;

  return (
    <Pressable
      onPress={handleOpenExercise}
      style={({ pressed }) => [
        {
          opacity: pressed ? pressedOpacity : 1,
        },
      ]}
    >
      <Card
        style={[common.rounded, spacing.pdHorizontalMd, spacing.pdVerticalDefault]}
        variant="gray"
      >
        <View style={[layout.flexRow, layout.justifyBetween]}>
          <View style={[layout.flex1, layout.justifyBetween]}>
            <Text style={{ flexShrink: 1 }} fontSize={16} numberOfLines={2} ellipsizeMode="tail">
              {exerciseId.name}
            </Text>
            <View style={[layout.flexRow]}>
              <Text fontVariant="semibold">{setCounter}</Text>
            </View>
          </View>

          <Image
            source={{
              uri: getExerciseImage(),
            }}
            height={66}
            width={72}
            style={[common.roundedSm, { flexShrink: 0 }]}
          />
        </View>
      </Card>
    </Pressable>
  );
};

export default ExerciseContainer;
