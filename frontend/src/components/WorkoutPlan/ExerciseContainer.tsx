import { FC, useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import WorkoutVideoPopup from "./WorkoutVideoPopup";
import SetContainer from "./SetContainer";
import NativeIcon from "../Icon/NativeIcon";
import { IExercise, IRecordedSet, IRecordedSetPost, ISet } from "@/interfaces/Workout";
import { ISession } from "@/interfaces/ISession";
import useStyles from "@/styles/useGlobalStyles";
import { useRecordedSetsApi } from "@/hooks/api/useRecordedSetsApi";
import { useUserStore } from "@/store/userStore";
import { extractVideoId, getYouTubeThumbnail } from "@/utils/utils";
import { Colors } from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { WorkoutPlanStackParamList } from "@/types/navigatorTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface WorkoutProps {
  plan: string;
  muscleGroup: string;
  exercise: IExercise;
  session: ISession;
  updateSession: (updatedSession: ISession) => void;
}

const ExerciseContainer: FC<WorkoutProps> = ({
  exercise,
  muscleGroup,
  plan,
  session,
  updateSession,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<WorkoutPlanStackParamList, "RecordSet">>();
  const videoId = extractVideoId(exercise.linkToVideo!);

  const currentUser = useUserStore((state) => state.currentUser);

  const { layout, text, fonts, common, colors } = useStyles();
  const { addRecordedSet } = useRecordedSetsApi();

  const [isSetDone, setIsSetDone] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [currentSet, setCurrentSet] = useState<ISet>(exercise.sets[currentSetNumber - 1]);

  const handleRecordSet = (recordedSet: Omit<IRecordedSet, "plan">) => {
    if (!currentUser) return;

    const setToRecord: IRecordedSetPost = {
      userId: currentUser._id,
      exercise: exercise.name,
      recordedSet: {
        ...recordedSet,
        plan,
      },
      muscleGroup,
    };

    addRecordedSet(setToRecord, session?._id || "")
      .then((response) => {
        const updatedSession = response.session;

        updateSession(updatedSession);
        handleSetCurrentSetInfo(updatedSession);
      })
      .catch((err) => console.error(err));
  };

  const handleSetCurrentSetInfo = (updatedSession: ISession) => {
    if (!updatedSession) return;
    const data = updatedSession.data;
    let exerciseData;

    const planData = data?.[plan];
    if (planData) {
      exerciseData = planData[exercise.name];
    }

    const setNumber = exerciseData?.setNumber + 1 || 1;

    if (setNumber - 1 <= exercise.sets.length - 1) {
      setCurrentSetNumber(setNumber);
      setCurrentSet(exercise.sets[setNumber - 1]);
    } else {
      setIsSetDone(true);
    }
  };

  useEffect(() => {
    handleSetCurrentSetInfo(session);
  }, [session]);

  return (
    <View style={[styles.workoutContainer, common.rounded, colors.backgroundSecondaryContainer]}>
      <View style={styles.workoutDescriptionContainer}>
        <View style={[layout.widthFull, layout.flexRow, layout.justifyBetween]}>
          <NativeIcon
            onPress={() => setIsSetDone((prev) => !prev)}
            library="Ionicons"
            name="checkmark-circle-outline"
            size={28}
            color={isSetDone ? colors.textPrimary.color : colors.textOnSecondaryContainer.color}
          />

          <Text style={[colors.textOnSecondaryContainer, text.textBold, fonts.lg]}>
            {exercise.name}
          </Text>
        </View>
        <View style={styles.workoutInfoContainer}>
          <NativeIcon
            onPress={() => {
              navigation.navigate("RecordSet", {
                exercise: exercise,
                handleRecordSet: (recordedSet) => handleRecordSet(recordedSet),
                setNumber: currentSetNumber,
              });
            }}
            color={colors.textOnSecondaryContainer.color}
            library="MaterialCommunityIcons"
            name="chevron-left"
            size={28}
          />

          <SetContainer currentSet={currentSet} currentSetNumber={currentSetNumber} />
        </View>
      </View>

      {/* <WorkoutVideoPopup
        title={exercise.name}
        isVisible={modalVisible}
        setIsVisible={setModalVisible}
        videoId={videoId}
      /> */}
    </View>
  );
};

export default ExerciseContainer;

const styles = StyleSheet.create({
  workoutContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    width: "100%",
    height: 125,
  },
  workoutDescriptionContainer: {
    padding: 12,
    gap: 20,
    flex: 1,
  },
  workoutInfoContainer: {
    flexDirection: "row",
    width: "100%",
    flexWrap: "wrap",
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
    width: 105,
    height: "100%",
    resizeMode: "center",
    marginHorizontal: 4,
  },
});
