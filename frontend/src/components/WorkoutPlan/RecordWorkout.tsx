import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import Button from "../Button/Button";

const RecordWorkout = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [time, setTime] = useState(0);

  return <View className="items-center "></View>;
};

export default RecordWorkout;

const styles = StyleSheet.create({});
