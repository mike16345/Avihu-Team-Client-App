import { FC, useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import SetContainer from "./SetContainer";
import NativeIcon from "../Icon/NativeIcon";
import { IExercise, IRecordedSet, IRecordedSetPost } from "@/interfaces/Workout";
import { ISession } from "@/interfaces/ISession";
import useStyles from "@/styles/useGlobalStyles";
import { useRecordedSetsApi } from "@/hooks/api/useRecordedSetsApi";
import { useUserStore } from "@/store/userStore";
import { useNavigation } from "@react-navigation/native";
import { WorkoutPlanStackParamList } from "@/types/navigatorTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import { Text } from "../ui/Text";
import { useLayoutStore } from "@/store/layoutStore";
import queryClient from "@/QueryClient/queryClient";
import { RECORDED_SETS_BY_USER_KEY } from "@/constants/reactQuery";

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
  const { addRecordedSet } = useRecordedSetsApi();
  const { setIsTopBarVisible } = useLayoutStore();

  const [currentSetNumber, setCurrentSetNumber] = useState(1);

  const handleRecordSet = (
    recordedSet: Omit<IRecordedSet, "plan">,
    sessionId = ""
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
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

      try {
        const response = await addRecordedSet(setToRecord, sessionId);
        const updatedSession = response.session;

        updateSession(updatedSession);
        handleSetCurrentSetInfo(updatedSession);
        queryClient.invalidateQueries({ queryKey: [RECORDED_SETS_BY_USER_KEY + currentUser._id] });
        Toast.show({
          text1: "סט הוקלט בהצלחה",
          text2: "כל הכבוד!",
          autoHide: true,
          type: "success",
          swipeable: true,
          text1Style: { textAlign: `center` },
          text2Style: { textAlign: `center` },
        });

        resolve();
      } catch (e) {
        reject(e);
      }
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

    setCurrentSetNumber(setNumber);
  };

  useEffect(() => {
    handleSetCurrentSetInfo(session);
  }, [session]);

  return (
    <TouchableOpacity
      onPress={() => {
        setIsTopBarVisible(false);
        navigation.navigate("RecordSet", {
          exercise: exercise,
          muscleGroup: muscleGroup,
          handleRecordSet: handleRecordSet,
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
