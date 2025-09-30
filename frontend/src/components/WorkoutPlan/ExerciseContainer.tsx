import { Image, Platform, Pressable, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import { IExercise } from "@/interfaces/Workout";
import {
  buildPhotoUrl,
  extractVideoId,
  getNextSetNumberFromSession,
  getYouTubeThumbnail,
} from "@/utils/utils";
import { useNavigation } from "@react-navigation/native";
import { WorkoutStackParamListNavigationProp } from "@/types/navigatorTypes";
import useWorkoutSession from "@/hooks/sessions/useWorkoutSession";
import PreviousSetCard from "./RecordExercise/PreviousSetCard";

interface ExerciseContainerProps {
  exercise: IExercise;
  muscleGroup: string;
  plan: string;
}

const ExerciseContainer: React.FC<ExerciseContainerProps> = ({ exercise, muscleGroup, plan }) => {
  const pressedOpacity = Platform.OS == "ios" ? 0.5 : 0.8;
  const { common, layout, spacing } = useStyles();
  const { exerciseId } = exercise;
  const { navigate } = useNavigation<WorkoutStackParamListNavigationProp>();
  const { session } = useWorkoutSession();
  const [setNumber, setSetNumber] = useState(1);

  const getExerciseImage = () => {
    return exerciseId.imageUrl
      ? buildPhotoUrl(exerciseId.imageUrl)
      : getYouTubeThumbnail(extractVideoId(exerciseId.linkToVideo));
  };

  const handleOpenExercise = () => {
    navigate("RecordExercise", {
      exercise,
      muscleGroup,
      setNumber,
      plan: plan,
    });
  };

  useEffect(() => {
    if (!session) return;
    const nextSet = getNextSetNumberFromSession(session, plan, exercise.exerciseId.name);

    setSetNumber(nextSet);
  }, [session]);

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
        <View style={[spacing.gapDefault]}>
          <View style={[layout.flexRow, layout.justifyBetween]}>
            <View style={[layout.flex1, spacing.gapLg]}>
              <Text style={{ flexShrink: 1 }} fontSize={16} numberOfLines={2} ellipsizeMode="tail">
                {exerciseId.name}
              </Text>
              <View style={[layout.flexRow]}>
                <Text fontVariant="semibold">
                  {setNumber}/{exercise.sets.length}
                </Text>
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
          <PreviousSetCard exercise={exerciseId.name} />
        </View>
      </Card>
    </Pressable>
  );
};

export default ExerciseContainer;
