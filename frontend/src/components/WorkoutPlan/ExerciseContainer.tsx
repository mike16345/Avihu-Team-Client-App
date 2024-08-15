import { Colors } from "@/constants/Colors";
import { IExercise, IRecordedSet, IRecordedSetPost } from "@/interfaces/Workout";
import { FC, useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Button from "@/components/Button/Button";
import WorkoutVideoPopup from "./WorkoutVideoPopup";
import RecordExercise from "./RecordExercise";
import Divider from "../ui/Divider";
import { extractVideoId, getYouTubeThumbnail } from "@/utils/utils";
import SetContainer from "./SetContainer";
import useStyles from "@/styles/useGlobalStyles";
import { useSessionsApi } from "@/hooks/api/useSessionsApi";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useRecordedSetsApi } from "@/hooks/api/useRecordedSetsApi";
import { useUserStore } from "@/store/userStore";

interface WorkoutProps {
  plan: string;
  muscleGroup: string;
  exercise: IExercise;
}

const ExerciseContainer: FC<WorkoutProps> = ({ exercise, muscleGroup, plan }) => {
  const videoId = extractVideoId(exercise.linkToVideo!);
  const thumbnail = getYouTubeThumbnail(videoId);

  const currentUser = useUserStore((state) => state.currentUser);

  const { getItem, setItem, removeItem } = useAsyncStorage("workout-session");
  const { getSession } = useSessionsApi();
  const { addRecordedSet } = useRecordedSetsApi();

  const { layout } = useStyles();

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [openRecordWorkout, setOpenRecordExercise] = useState(false);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [currentSet, setCurrentSet] = useState(exercise.sets[currentSetNumber - 1]);

  const getWorkoutSession = async () => {
    const session = await getItem();

    if (!session) return;

    try {
      const sessionJSON = JSON.parse(session);
      const sessionId = sessionJSON.session._id;
      const currentWorkoutSession = await getSession(sessionId || "");

      if (!currentWorkoutSession) {
        removeItem();
        setCurrentSessionId(null);
      }

      setCurrentSessionId(sessionId);
      return currentWorkoutSession;
    } catch (e) {
      throw e;
    }
  };

  const handleRecordSet = (recordedSet: Omit<IRecordedSet, "plan">) => {
    if (!currentUser) return;

    const setToRecord: IRecordedSetPost = {
      userId: currentUser._id,
      exercise: exercise.name,
      recordedSet: {
        ...recordedSet,
        plan: plan,
      },
      muscleGroup,
    };

    addRecordedSet(setToRecord, currentSessionId || "")
      .then((response) => setItem(JSON.stringify(response)))
      .catch((err) => console.error(err));
  };

  const handleSessionNotFound = (e: any) => {
    if (e.response.status === 404) {
      setCurrentSetNumber(1);
      removeItem();
    }
    setCurrentSessionId(null);
  };

  useEffect(() => {
    getWorkoutSession()
      .then((session: any) => setCurrentSetNumber(session?.data?.setNumber || 1))
      .catch((err) => handleSessionNotFound(err));
  }, []);

  return (
    <View style={styles.workoutContainer}>
      <Button style={layout.center} onPress={() => setModalVisible(true)}>
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
      </Button>
      <Divider orientation="vertical" />
      <View style={styles.workoutDescriptionContainer}>
        <Text style={styles.workoutTitle}>{exercise.name}</Text>
        <View style={styles.workoutInfoContainer}>
          <SetContainer currentSet={currentSet} currentSetNumber={currentSetNumber} />

          <Button
            textProps={{ style: styles.recordBtnText }}
            style={styles.recordWorkoutBtn}
            onPress={() => setOpenRecordExercise(true)}
          >
            הקלט
          </Button>
        </View>
      </View>
      <RecordExercise
        exerciseName={exercise.name}
        handleRecordSet={(recordedSet) => handleRecordSet(recordedSet)}
        setNumber={currentSetNumber}
        isOpen={openRecordWorkout}
        setIsOpen={setOpenRecordExercise}
      />
      <WorkoutVideoPopup
        title={exercise.name}
        isVisible={modalVisible}
        setIsVisible={setModalVisible}
        videoId={videoId}
      />
    </View>
  );
};

export default ExerciseContainer;

const styles = StyleSheet.create({
  workoutContainer: {
    direction: `ltr`,
    display: "flex",
    flexDirection: "row-reverse",
    alignItems: "center",
    width: "100%",
    height: 100,
    backgroundColor: Colors.bgSecondary,
    padding: 2,
    margin: 5,
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
  setsContainer: {
    flexDirection: "column",
    alignItems: `flex-end`,
    gap: 5,
  },
  RepsContainer: {
    flexDirection: `row-reverse`,
    justifyContent: `space-around`,
    gap: 8,
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
    width: 105,
    height: "100%",
    resizeMode: "stretch",
    marginLeft: 4,
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
