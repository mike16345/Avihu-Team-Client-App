import { IExercise } from "@/interfaces/Workout";
import {
  View,
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  Animated,
} from "react-native";
import ExerciseSetDetails from "./ExerciseSetDetails";
import { FC, useEffect, useRef, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { extractVideoId, getYouTubeThumbnail } from "@/utils/utils";
import { Text } from "@/components/ui/Text";
import { useShadowStyles } from "@/styles/useShadowStyles";
import Icon from "@/components/Icon/Icon";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import YoutubePlayer, { PLAYER_STATES, YoutubeIframeRef } from "react-native-youtube-iframe";
import SpinningIcon from "@/components/ui/loaders/SpinningIcon";
import { useLayoutStore } from "@/store/layoutStore";

interface ExerciseVideoProps {
  exercise: IExercise;
}

const VIDEO_HEIGHT = 180;

const ExerciseVideo: FC<ExerciseVideoProps> = ({ exercise }) => {
  const { exerciseMethod, sets } = exercise;
  const isSheetExpanded = useLayoutStore((state) => state.isSheetExpanded);

  const { width } = useWindowDimensions();
  const { layout, colors, common, spacing } = useStyles();

  const cornerRadius = common.roundedSm.borderRadius;

  const { frameLayer5 } = useShadowStyles();

  const videoId = extractVideoId(exercise.exerciseId.linkToVideo);
  const thumbnail = getYouTubeThumbnail(videoId);

  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playerRef = useRef<YoutubeIframeRef | null>(null);
  const opacityValue = new Animated.Value(1);

  const handleFadeSetDetails = (to: number) => {
    opacityValue.stopAnimation?.();
    Animated.timing(opacityValue, {
      toValue: Math.max(0, Math.min(1, to)),
      useNativeDriver: true,
      duration: 200,
    }).start();
  };

  const handleVideoStateChange = (state: PLAYER_STATES) => {
    switch (state) {
      case PLAYER_STATES.PLAYING:
        handleFadeSetDetails(0);
        break;
      case PLAYER_STATES.PAUSED:
        handleFadeSetDetails(1);
        break;
    }
  };

  const handlePlay = () => {
    setIsLoading(true);
    setIsPlaying(true);
  };

  const onReady = () => {
    if (!playerRef.current) return;
    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      setIsLoading(false);
      setIsPlaying(false);
    };
  }, []);

  return (
    <View style={[layout.center]}>
      <View>
        <Animated.View
          style={[styles.setDetails, { opacity: opacityValue, pointerEvents: "none" }]}
        >
          <ExerciseSetDetails sets={sets} exerciseMethod={exerciseMethod} />
        </Animated.View>
        <ConditionalRender condition={!isPlaying}>
          <View style={styles.playButton}>
            <TouchableOpacity onPress={handlePlay}>
              <Icon name="playCircle" width={60} height={60} />
            </TouchableOpacity>
          </View>

          <Image
            style={[
              {
                borderTopLeftRadius: cornerRadius,
                borderTopRightRadius: cornerRadius,
                width: width * 0.9,
              },
            ]}
            source={{ uri: thumbnail }}
            height={VIDEO_HEIGHT}
          />
        </ConditionalRender>

        <ConditionalRender condition={isPlaying}>
          <View
            pointerEvents={isSheetExpanded ? "none" : "auto"}
            style={[styles.playerContainer, { width: width * 0.9, height: VIDEO_HEIGHT }]}
          >
            <YoutubePlayer
              ref={playerRef}
              play={isPlaying}
              height={VIDEO_HEIGHT}
              videoId={videoId}
              onReady={onReady}
              onChangeState={handleVideoStateChange}
              initialPlayerParams={{ loop: true, rel: false }}
              webViewStyle={{ height: VIDEO_HEIGHT - 30 }}
              viewContainerStyle={{ height: VIDEO_HEIGHT }}
            />
            {isLoading && (
              <View style={styles.spinnerOverlay}>
                <SpinningIcon mode="light" />
              </View>
            )}
          </View>
        </ConditionalRender>
        <View
          style={[
            frameLayer5,
            {
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: cornerRadius,
              borderBottomRightRadius: cornerRadius,
            },
            layout.center,
            colors.backgroundSurface,
            spacing.pdHorizontalMd,
            spacing.pdVerticalMd,
          ]}
        >
          <Text style={{ flexShrink: 1 }} fontSize={18} numberOfLines={2} ellipsizeMode="tail">
            {exercise.exerciseId.name}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ExerciseVideo;

const styles = StyleSheet.create({
  setDetails: { position: "absolute", right: 10, top: 10, zIndex: 1 },
  playButton: { position: "absolute", zIndex: 2, top: "25%", right: "40%" },

  // NEW:
  playerContainer: {
    overflow: "hidden",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
});
