import { Colors } from "@/constants/Colors";
import { FC, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
  Dimensions,
} from "react-native";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";
import React from "react";

interface WorkoutVideoPopupProps {
  videoId: string;
  title: string;
}

const WorkoutVideoPopup: FC<WorkoutVideoPopupProps> = ({ videoId, title }) => {
  const { width } = useWindowDimensions();

  const [isLoading, setIsLoading] = useState(true);
  const [canPlay, setCanPlay] = useState(false);
  const playerRef = useRef<YoutubeIframeRef | null>(null);

  const onReady = () => {
    if (!playerRef.current) return;
    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      setIsLoading(true);
      setCanPlay(false);
    };
  }, []);

  return (
    <React.Fragment>
      <View>
        <YoutubePlayer
          ref={playerRef}
          play={canPlay}
          onReady={onReady}
          initialPlayerParams={{ loop: true }}
          width={width - 40}
          height={200}
          videoId={videoId}
        />
      </View>
    </React.Fragment>
  );
};

export default WorkoutVideoPopup;
2