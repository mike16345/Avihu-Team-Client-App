import { StyleSheet, Text, View } from "react-native";
import { FC } from "react";
import { ISet } from "@/interfaces/Workout";
import { Colors } from "@/constants/Colors";

interface SetContainerProps {
  currentSetNumber: number;
  currentSet: ISet;
}

const SetContainer: FC<SetContainerProps> = ({ currentSet, currentSetNumber }) => {
  return (
    <View style={styles.setsContainer}>
      <Text style={styles.set}>סט: {currentSetNumber}</Text>
      <View style={styles.RepsContainer}>
        <Text style={styles.set}>חזרות:</Text>
        <Text style={styles.set}>מינ:{currentSet.minReps}</Text>
        <Text style={styles.set}>מקס:{currentSet.minReps}</Text>
      </View>
    </View>
  );
};

export default SetContainer;

const styles = StyleSheet.create({
  setsContainer: {
    alignItems: `flex-end`,
    gap: 5,
  },
  set: {
    color: Colors.light,
    fontSize: 14,
    fontWeight: "600",
  },
  RepsContainer: {
    flexDirection: `row-reverse`,
    justifyContent: `space-around`,
    gap: 8,
  },
});
