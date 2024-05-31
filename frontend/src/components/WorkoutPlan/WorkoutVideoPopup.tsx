import { Colors } from "@/constants/Colors";
import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { Dialog } from "react-native-elements";
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
      overlayStyle={{
        backgroundColor: Colors.secondary,
        width: 400,
        height: 350,
        alignItems: "center",
      }}
      isVisible={isVisible}
      onBackdropPress={() => setIsVisible(false)}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {isLoading && <ActivityIndicator size="large" color={Colors.primary} />}
        <YoutubePlayer
          ref={playerRef}
          play={canPlay}
          onReady={onReady}
          initialPlayerParams={{ loop: true }}
          width={300}
          height={200}
          videoId={videoId}
        />
      </View>
    </Dialog>
  );
};

export default WorkoutVideoPopup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 20,
    color: Colors.primary,
  },
});
