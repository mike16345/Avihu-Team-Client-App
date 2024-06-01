import { Colors } from "@/constants/Colors";
import { IWorkout } from "@/interfaces/Workout";
import { FC, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Button from "@/components/Button/Button";
import { Divider } from "react-native-elements";
import WorkoutVideoPopup from "./WorkoutVideoPopup";
import RecordWorkout from "./RecordWorkout";

interface WorkoutProps {
  workout: IWorkout;
}
const extractVideoId = (url: string) => {
  return url.split("v=")[1].split("&")[0];
};
const getYouTubeThumbnail = (id: string) => {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
};

const Workout: FC<WorkoutProps> = ({ workout }) => {
  const videoId = extractVideoId(workout.linkToVideo!);
  const thumbnail = getYouTubeThumbnail(videoId);

  const [modalVisible, setModalVisible] = useState(false);
  const [openRecordWorkout, setOpenRecordWorkout] = useState(false);

  return (
    <View style={styles.workoutContainer}>
      <Button
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={() => setModalVisible(true)}
      >
        <Image source={{ uri: thumbnail }} borderRadius={2} style={styles.thumbnail} />
      </Button>
      <Divider width={0.5} color={Colors.dark} orientation="vertical" />
      <View style={styles.workoutDescriptionContainer}>
        <Text style={styles.workoutTitle}>{workout.name}</Text>
        <View style={styles.workoutInfoContainer}>
          <Text style={styles.set}>סט: 1</Text>
          <Text style={styles.set}>חזרות: 15</Text>
          <Button
            textProps={{ style: styles.recordBtnText }}
            style={styles.recordWorkoutBtn}
            onPress={() => setOpenRecordWorkout(true)}
          >
            הקלט
          </Button>
        </View>
      </View>
      <RecordWorkout
        workoutName={workout.name}
        setNumber={1} // TODO: Check what set user is on and send that.
        isOpen={openRecordWorkout}
        setIsOpen={setOpenRecordWorkout}
      />
      <WorkoutVideoPopup
        title={workout.name}
        isVisible={modalVisible}
        setIsVisible={setModalVisible}
        videoId={videoId}
      />
    </View>
  );
};

export default Workout;

const styles = StyleSheet.create({
  workoutContainer: {
    display: "flex",
    flexDirection: "row-reverse",
    alignItems: "center",
    width: "100%",
    height: 100,
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
  set: {
    color: Colors.light,
    fontSize: 12,
    fontWeight: "600",
  },
  workoutDescriptionContainer: {
    padding: 12,
    gap: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recordBtnText: {
    color: Colors.dark,
    fontWeight: "600",
  },
  thumbnail: {
    width: 95,
    height: 90,
    resizeMode: "cover",
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
