import { IExercise } from "@/interfaces/Workout";
import { View, StyleSheet, Image, useWindowDimensions } from "react-native";
import ExerciseSetDetails from "./ExerciseSetDetails";
import { FC } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { extractVideoId, getYouTubeThumbnail } from "@/utils/utils";
import { Text } from "@/components/ui/Text";
import { useShadowStyles } from "@/styles/useShadowStyles";
import Icon from "@/components/Icon/Icon";

interface ExerciseVideoProps {
  exercise: IExercise;
}

const ExerciseVideo: FC<ExerciseVideoProps> = ({ exercise }) => {
  const { width } = useWindowDimensions();
  const { layout, colors, common, spacing } = useStyles();
  const { frameLayer1 } = useShadowStyles();
  const { exerciseMethod, sets } = exercise;
  const thumbnail = getYouTubeThumbnail(extractVideoId(exercise.exerciseId.linkToVideo));

  const cornerRadius = common.roundedSm.borderRadius;

  return (
    <View style={[layout.center]}>
      <View>
        <View style={styles.setDetails}>
          <ExerciseSetDetails sets={sets} exerciseMethod={exerciseMethod} />
        </View>
        <View style={styles.playButton}>
          <Icon name="playCircle" width={60} height={60} />
        </View>
        <Image
          style={[{ borderTopLeftRadius: cornerRadius, borderTopRightRadius: cornerRadius }]}
          src={thumbnail}
          width={width * 0.9}
          height={160}
        />
        <View
          style={[
            { borderBottomLeftRadius: cornerRadius, borderBottomRightRadius: cornerRadius },
            layout.center,
            colors.backgroundSurface,
            spacing.pdHorizontalLg,
            spacing.pdVerticalMd,
          ]}
        >
          <Text fontSize={18}>{exercise.exerciseId.name}</Text>
        </View>
      </View>
    </View>
  );
};

export default ExerciseVideo;

const styles = StyleSheet.create({
  setDetails: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 1,
  },

  playButton: {
    position: "absolute",
    zIndex: 1,
    top: "25%",
    right: "38%",
  },
});
