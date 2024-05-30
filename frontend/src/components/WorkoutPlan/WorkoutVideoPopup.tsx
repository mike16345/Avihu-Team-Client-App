import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import React from "react";
import YoutubePlayer from "react-native-youtube-iframe";

const WorkoutVideoPopup = () => {
  const { width, height } = useWindowDimensions();

  return (
    <View className="flex-1 bg-black h-screen items-center justify-center p-4">
      <YoutubePlayer
        initialPlayerParams={{ loop: true }}
        width={width}
        height={height / 2}
        videoId="lTEI3pJITOY"
      />
    </View>
  );
};

export default WorkoutVideoPopup;

const styles = StyleSheet.create({});
