import { Image, Platform, Pressable, View } from "react-native";
import React, { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import { IExercise } from "@/interfaces/Workout";
import { buildPhotoUrl, extractVideoId, getYouTubeThumbnail } from "@/utils/utils";
import { useNavigation } from "@react-navigation/native";
import { WorkoutStackParamListNavigationProp } from "@/types/navigatorTypes";
import PreviousSetCard from "./RecordExercise/PreviousSetCard";
import { useWorkoutSessionStore } from "@/store/workoutSessionStore";

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
  const { workoutSession, getNextSetNumber } = useWorkoutSessionStore();

  const setNumber = useMemo(() => {
    if (!workoutSession) return 1;

    return getNextSetNumber(plan, exercise.exerciseId.name);
  }, [exercise.exerciseId.name, plan, workoutSession]);

  const getExerciseImage = () => {
    return exerciseId.imageUrl
      ? buildPhotoUrl(exerciseId.imageUrl)
      : getYouTubeThumbnail(extractVideoId(exerciseId.linkToVideo));
  };

  const handleOpenExercise = () => {
    navigate("RecordExercise", {
      exercise,
      muscleGroup,
      plan: plan,
    });
  };

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
              <Text
                style={{ flexShrink: 1, alignSelf: "flex-start" }}
                fontSize={16}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {exerciseId.name}
              </Text>
              <View style={[layout.flexRow]}>
                <Text fontVariant="semibold">
                  {setNumber - 1}/{exercise.sets.length}
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
