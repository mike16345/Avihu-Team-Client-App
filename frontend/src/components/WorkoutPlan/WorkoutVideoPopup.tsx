import { Colors } from "@/constants/Colors";
import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator, useWindowDimensions } from "react-native";
import { Dialog } from "react-native-paper";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";

interface WorkoutVideoPopupProps {
  isVisible: boolean;
  videoId: string;
  title: string;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
}

const WorkoutVideoPopup: FC<WorkoutVideoPopupProps> = ({
  isVisible,
  setIsVisible,
  videoId,
  title,
}) => {
  const { width, height } = useWindowDimensions();

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
    <Dialog
      style={{
        backgroundColor: Colors.secondary,
        width: width - 25,
        height: height / 2,
        alignItems: "center",
      }}
      visible={isVisible}
      onDismiss={() => setIsVisible(false)}
      dismissableBackButton
    >
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {isLoading && <ActivityIndicator size="large" color={Colors.primary} />}
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
      <Text style={styles.tip}>דגשים: אל תשבור את הכתף</Text>
    </Dialog>
  );
};

export default WorkoutVideoPopup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    // alignSelf: "center",
  },
  tip: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    color: Colors.primary,
  },
});
