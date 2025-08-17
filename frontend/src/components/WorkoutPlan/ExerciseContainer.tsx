import { Image, Platform, Pressable, TouchableOpacity, View } from "react-native";
import React from "react";
import { Card } from "@/components/ui/Card";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import { IExercise } from "@/interfaces/Workout";
import { buildPhotoUrl, extractVideoId, getYouTubeThumbnail } from "@/utils/utils";

interface ExerciseContainerProps {
  exercise: IExercise;
  exerciseCounter: string;
}

const ExerciseContainer: React.FC<ExerciseContainerProps> = ({
  exercise: { exerciseId },
  exerciseCounter,
}) => {
  const { common, layout, spacing, text } = useStyles();

  const getExerciseImage = () => {
    return exerciseId.imageUrl
      ? buildPhotoUrl(exerciseId.imageUrl)
      : getYouTubeThumbnail(extractVideoId(exerciseId.linkToVideo));
  };

  const pressedOpacity = Platform.OS == "ios" ? 0.5 : 0.8;

  return (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? pressedOpacity : 1,
        },
      ]}
    >
      <Card variant="gray">
        <View style={[layout.flexRow, layout.justifyBetween]}>
          <View style={[spacing.gapXl]}>
            <Text>{exerciseId.name}</Text>
            <Text style={[layout.alignSelfStart, text.textBold]}>{exerciseCounter}</Text>
          </View>

          <Image
            source={{
              uri: getExerciseImage(),
            }}
            height={66}
            width={72}
            style={[common.rounded]}
          />
        </View>
      </Card>
    </Pressable>
  );
};

export default ExerciseContainer;
