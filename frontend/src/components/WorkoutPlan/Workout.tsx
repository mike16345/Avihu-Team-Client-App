import { Colors } from "@/constants/Colors";
import { IWorkout } from "@/interfaces/Workout";
import { FC, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View, Modal } from "react-native";
import Button from "../Button/Button";
import { Divider } from "react-native-elements";

interface WorkoutProps {
  workout: IWorkout;
}

const getYouTubeThumbnail = (url: string) => {
  const videoId = url.split("v=")[1].split("&")[0];
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const Workout: FC<WorkoutProps> = ({ workout }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const thumbnail = getYouTubeThumbnail(workout.linkToVideo!);

  return (
    <View style={styles.workoutContainer}>
      <Pressable onPress={() => setModalVisible(true)}>
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
      </Pressable>
      <Divider width={0.5} color={Colors.dark} orientation="vertical" />
      <View style={styles.workoutDescriptionContainer}>
        <Text style={styles.workoutTitle}>{workout.name}</Text>
        <View style={styles.workoutInfoContainer}>
          <Text style={styles.workoutTitle}>סט: 1</Text>
          <Text style={styles.workoutTitle}>חזרות: 15</Text>
          <Button style={styles.recordWorkoutBtn} onPress={() => console.log("record set")}>
            <Text style={styles.recordBtnText}>הקלט</Text>
          </Button>
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Video Popup</Text>
          <Button onPress={() => setModalVisible(!modalVisible)}>
            <Text style={styles.recordBtnText}>Close</Text>
          </Button>
        </View>
      </Modal>
    </View>
  );
};

export default Workout;

const styles = StyleSheet.create({
  workoutContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    width: "100%",
    backgroundColor: Colors.bgSecondary,
    padding: 2,
    borderRadius: 10,
    justifyContent: "space-between",
  },
  workoutTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  workoutDescriptionContainer: {
    padding: 12,
    gap: 12,
    flex: 1,
  },
  workoutInfoContainer: {
    flexDirection: "row-reverse",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordWorkoutBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recordBtnText: {
    color: Colors.dark,
    fontWeight: "600",
  },
  thumbnail: {
    flex: 1,
    width: 90,
    height: 90,
    resizeMode: "center",
    marginLeft: 8,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
