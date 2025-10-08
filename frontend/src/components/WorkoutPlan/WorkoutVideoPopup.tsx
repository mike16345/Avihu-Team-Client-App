import { FC, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import YoutubePlayer, { PLAYER_STATES, YoutubeIframeRef } from "react-native-youtube-iframe";
import { getYouTubeThumbnail } from "@/utils/utils";
import Icon from "../Icon/Icon";

interface WorkoutVideoPopupProps {
  videoId: string;
  width?: number;
  height?: number;
}

const WorkoutVideoPopup: FC<WorkoutVideoPopupProps> = ({ videoId, width, height = 200 }) => {
  const { width: windowWidth } = useWindowDimensions();
  const videoWidth = width || windowWidth - 40; // Account for padding
  const videoHeight = Platform.OS === "ios" ? height + 50 : height;
  const thumbnailUrl = getYouTubeThumbnail(videoId);

  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<YoutubeIframeRef | null>(null);

  const onReady = () => {
    if (!playerRef.current) return;
    setIsLoading(false);
  };

  const handlePlay = () => {
    setIsLoading(true);
    setIsPlaying(true);
  };

  const handleVideoStateChange = (state: PLAYER_STATES) => {
    if (state === "ended") {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      setIsLoading(false);
      setIsPlaying(false);
    };
  }, []);

  return (
    <View style={[styles.container, { width: videoWidth }]}>
      {!isPlaying ? (
        <TouchableOpacity
          style={[
            styles.thumbnailContainer,
            { height: videoHeight * 0.85, width: videoWidth * 0.95 },
          ]}
          onPress={handlePlay}
        >
          <Image
            source={{ uri: thumbnailUrl }}
            style={[
              styles.thumbnail,
              { height: videoHeight * 0.85, width: videoWidth * 0.95 }, // Adjusted for spacing
            ]}
          />
          <View style={styles.playButton}>
            <Icon name="playCircle" height={50} width={50} variant="solid" />
          </View>
        </TouchableOpacity>
      ) : (
        <>
          {isLoading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="red" />
            </View>
          )}

          <YoutubePlayer
            ref={playerRef}
            play={isPlaying}
            onReady={onReady}
            onChangeState={handleVideoStateChange}
            initialPlayerParams={{ loop: false, rel: false }}
            width={Platform.OS == `ios` ? videoWidth * 0.95 : videoWidth}
            height={Platform.OS == `ios` ? videoHeight * 0.85 : videoHeight}
            videoId={videoId}
            webViewStyle={styles.video}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    alignItems: `center`,
    ...Platform.select({
      ios: {
        padding: 10,
      },
    }),
  },
  thumbnailContainer: {
    alignItems: "center",
    paddingTop: 4,
    borderRadius: 15,
  },
  thumbnail: {
    borderRadius: 15,
    overflow: "hidden",
  },
  playButton: {
    alignItems: "center",
    width: "100%",
    position: "absolute",
    transform: [{ translateY: -25 }],
    top: "50%",
    zIndex: 1,
  },
  playIcon: {
    fontSize: 50,
    opacity: 0.8,
  },
  video: {
    borderRadius: 15,
    overflow: `hidden`,
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
});

export default WorkoutVideoPopup;
