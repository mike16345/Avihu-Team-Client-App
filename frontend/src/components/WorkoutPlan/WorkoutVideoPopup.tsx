import { FC, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import YoutubePlayer, { PLAYER_STATES, YoutubeIframeRef } from "react-native-youtube-iframe";
import NativeIcon from "@/components/Icon/NativeIcon"; // Assuming this is where your NativeIcon component is located
import { getYouTubeThumbnail } from "@/utils/utils";

interface WorkoutVideoPopupProps {
  videoId: string;
  width?: number;
  height?: number;
}

const WorkoutVideoPopup: FC<WorkoutVideoPopupProps> = ({ videoId, width, height = 200 }) => {
  const videoWidth = width || useWindowDimensions().width - 40;
  const thumbnailUrl = getYouTubeThumbnail(videoId); // URL for high-quality thumbnail

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
      // When the video ends, return to the thumbnail view
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
    <View style={[styles.container, { width: width }]}>
      {!isPlaying ? (
        <TouchableOpacity style={styles.thumbnailContainer} onPress={handlePlay}>
          <Image source={{ uri: thumbnailUrl }} style={[{ width: videoWidth, height }]} />
          <View style={styles.playButton}>
            <NativeIcon
              library="MaterialCommunityIcons"
              name="play"
              color={"white"}
              style={styles.playIcon}
            />
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
            width={videoWidth}
            height={height}
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
  },
  thumbnailContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }], // Center the play button
    zIndex: 1,
  },
  playIcon: {
    fontSize: 50,
    opacity: 0.8,
  },
  video: {
    borderRadius: 12,
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2, // Make sure the loader is above the iframe
  },
});

export default WorkoutVideoPopup;
