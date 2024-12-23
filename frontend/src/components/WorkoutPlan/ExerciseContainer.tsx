import { FC, useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import SetContainer from "./SetContainer";
import NativeIcon from "../Icon/NativeIcon";
import { IExercise, IRecordedSet, IRecordedSetPost } from "@/interfaces/Workout";
import { ISession } from "@/interfaces/ISession";
import useStyles from "@/styles/useGlobalStyles";
import { useRecordedSetsApi } from "@/hooks/api/useRecordedSetsApi";
import { useUserStore } from "@/store/userStore";
import { Colors } from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { WorkoutPlanStackParamList } from "@/types/navigatorTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import { Text } from "../ui/Text";

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

  const currentUser = useUserStore((state) => state.currentUser);

  const { layout, text, fonts, common, colors } = useStyles();
  const { addRecordedSet, getUserRecordedSetsByExercise } = useRecordedSetsApi();

  const [currentSetNumber, setCurrentSetNumber] = useState(1);

  const handleRecordSet = (
    recordedSet: Omit<IRecordedSet, "plan">,
    isEdit = false
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!currentUser) {
        reject(new Error("No current user available"));
        return;
      }

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

          Toast.show({
            text1: "סט הוקלט בהצלחה",
            text2: "כל הכבוד!",
            autoHide: true,
            type: "success",
            swipeable: true,
            text1Style: { textAlign: `center` },
            text2Style: { textAlign: `center` },
          });
          navigation?.goBack();

          resolve(); // Resolve the promise after successful completion
        })
        .catch((err) => {
          console.error(err);
          reject(err); // Reject the promise if there's an error
        });
    });
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

    if (setNumber - 1 <= exercise.sets?.length - 1) {
      setCurrentSetNumber(setNumber);
    } else {
      setCurrentSetNumber(setNumber);
    }
  };

  useEffect(() => {
    handleSetCurrentSetInfo(session);
  }, [session]);

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.setOptions({ title: exercise.name });
        navigation.navigate("RecordSet", {
          exercise: exercise,
          muscleGroup: muscleGroup,
          handleRecordSet: (recordedSet) => handleRecordSet(recordedSet),
          setNumber: currentSetNumber,
        });
      }}
    >
      <View style={[styles.workoutContainer, common.rounded, colors.backgroundSecondaryContainer]}>
        <View style={styles.workoutDescriptionContainer}>
          <View style={[layout.widthFull]}>
            <Text
              style={[
                colors.textOnSecondaryContainer,
                text.textBold,
                fonts.default,
                text.textRight,
              ]}
            >
              {exercise.name}
            </Text>
          </View>
          <View style={styles.workoutInfoContainer}>
            <NativeIcon
              color={colors.textOnSecondaryContainer.color}
              library="MaterialCommunityIcons"
              name="chevron-left"
              size={28}
            />

            <SetContainer
              currentSetNumber={currentSetNumber}
              totalSets={exercise.sets.length}
              handleViewSet={(setNumber) => {
                if (setNumber >= currentSetNumber) return;
                console.log("viewSet", setNumber);
                navigation.setOptions({ title: exercise.name });
                navigation.navigate("RecordSet", {
                  recordedSet: {},
                  exercise: exercise,
                  muscleGroup: muscleGroup,
                  handleRecordSet: (recordedSet) => handleRecordSet(recordedSet, true),
                  setNumber: currentSetNumber,
                });
              }}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ExerciseContainer;

const styles = StyleSheet.create({
  workoutContainer: {
    padding: 20,
    width: "100%",
    height: 125,
  },
  workoutDescriptionContainer: {
    justifyContent: "space-between",
    flex: 1,
  },
  workoutInfoContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
