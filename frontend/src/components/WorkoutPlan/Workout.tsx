import { Colors } from "@/constants/Colors";
import { IExercise, IWorkout } from "@/interfaces/Workout";
import { FC, useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Button from "@/components/Button/Button";
import WorkoutVideoPopup from "./WorkoutVideoPopup";
import RecordWorkout from "./RecordWorkout";
import { useAppTheme } from "@/themes/useAppTheme";
import Divider from "../ui/Divider";

interface WorkoutProps {
  workout: IExercise;
}
const extractVideoId = (url: string) => {
  return url.split("v=")[1].split("&")[0];
};

const getYouTubeThumbnail = (id: string) => {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
};

const Workout: FC<WorkoutProps> = ({ workout }) => {
  const theme = useAppTheme();
  const videoId = extractVideoId(workout.linkToVideo!);
  const thumbnail = getYouTubeThumbnail(videoId);

  const [modalVisible, setModalVisible] = useState(false);
  const [openRecordWorkout, setOpenRecordWorkout] = useState(false);
  const [currentSet,setCurrentSet]=useState(workout.sets[0])
  const [currentSetNumber,setCurrentSetNumber]=useState(workout.sets.indexOf(currentSet)+1)

  useEffect(()=>{
    setCurrentSet(workout.sets[0])
    setCurrentSetNumber(1)
  },[workout])

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
      <Divider orientation="vertical" />
      <View style={styles.workoutDescriptionContainer}>
        <Text style={styles.workoutTitle}>{workout.name}</Text>
        <View style={styles.workoutInfoContainer}>
          <View style={styles.setsContainer}>
            <Text style={styles.set}>סט:{currentSetNumber}</Text>
            <View style={styles.RepsContainer}>
              <Text style={styles.set}>חזרות:</Text>
              <Text style={styles.set}>מינ:{currentSet.minReps}</Text>
              <Text style={styles.set}>מקס:{currentSet.minReps}</Text>
            </View>
          </View>
          
          <Button
            textProps={{ style: styles.recordBtnText}}
            style={styles.recordWorkoutBtn}
            onPress={() => setOpenRecordWorkout(true)}
          >
            הקלט
          </Button>
        </View>
      </View>
      <RecordWorkout
        workoutName={workout.name}
        setNumber={currentSetNumber} 
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
    direction:`ltr`,
    display: "flex",
    flexDirection: "row-reverse",
    alignItems: "center",
    width: "100%",
    height: 100,
    backgroundColor: Colors.bgSecondary,
    padding: 2,
    margin:5,
    borderRadius: 10,
    justifyContent: "space-between",
  },
  workoutTitle: {
    textAlign: "right",
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  set: {
    color: Colors.light,
    fontSize: 14,
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
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
  },
  setsContainer:{
    flexDirection:"column",
    alignItems:`flex-end`,
    gap:5
  },
  RepsContainer:{
    flexDirection:`row-reverse`,
    justifyContent:`space-around`,
    gap:8
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
