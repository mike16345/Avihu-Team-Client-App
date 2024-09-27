import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useState, useEffect, FC } from "react";
import logoBlack from "@assets/avihu/avihu-logo-black.png";
import DropDownPicker, { ValueType } from "react-native-dropdown-picker";
import { ICompleteWorkoutPlan, IWorkoutPlan } from "@/interfaces/Workout";
import WorkoutTips from "./WorkoutTips";
import { Colors } from "@/constants/Colors";
import { useWorkoutPlanApi } from "@/hooks/api/useWorkoutPlanApi";
import ExerciseContainer from "./ExerciseContainer";
import useStyles from "@/styles/useGlobalStyles";
import { useUserStore } from "@/store/userStore";
import { useSessionsApi } from "@/hooks/api/useSessionsApi";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { StackNavigatorProps, WorkoutPlanStackParamList } from "@/types/navigatorTypes";

const width = Dimensions.get("window").width;
interface WorkoutPlanProps
  extends StackNavigatorProps<WorkoutPlanStackParamList, "WorkoutPlanPage"> {}

const WorkoutPlan: FC<WorkoutPlanProps> = ({ navigation }) => {
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<any[] | null>(null);
  const [value, setValue] = useState<ValueType>();
  const [openTips, setOpenTips] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<ICompleteWorkoutPlan>();
  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<IWorkoutPlan | null>(null);
  const [currentWorkoutSession, setCurrentWorkoutSession] = useState<any>(null);

  const { fonts, text, spacing } = useStyles();
  const { getWorkoutPlanByUserId } = useWorkoutPlanApi();
  const { currentUser } = useUserStore();
  const { getItem, setItem, removeItem } = useAsyncStorage("workout-session");
  const { getSession } = useSessionsApi();

  const selectNewWorkoutPlan = (planName: string) => {
    const selectedWorkoutPlan = workoutPlan?.workoutPlans.find(
      (plan) => plan.planName === planName
    );

    if (selectedWorkoutPlan) setCurrentWorkoutPlan({ ...selectedWorkoutPlan });
  };

  useEffect(() => {
    if (!currentUser) return;

    getWorkoutPlanByUserId(currentUser._id)
      .then((res) => setWorkoutPlan(res))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (!workoutPlan) return;

    const plans = workoutPlan.workoutPlans.map((workout) => {
      return { label: workout.planName, value: workout.planName };
    });

    setPlans(plans);
    setValue(plans[0].label);
    setCurrentWorkoutPlan(workoutPlan.workoutPlans[0]);

    // Load the session details for the current workout plan
    loadWorkoutSession();
  }, [workoutPlan]);

  const loadWorkoutSession = async () => {
    const session = await getItem();
    if (!session) return;

    try {
      const sessionJSON = JSON.parse(session);
      const sessionId = sessionJSON?._id || "";
      const currentWorkoutSession = await getSession(sessionId || "");
      if (!currentWorkoutSession) {
        removeItem();
      } else {
        setCurrentWorkoutSession(currentWorkoutSession);
      }
    } catch (e) {
      handleSessionNotFound(e);
    }
  };

  const handleSessionNotFound = (e: any) => {
    console.error(e);
    removeItem();
    setCurrentWorkoutSession(null);
  };

  const handleUpdateSession = async (session: any) => {
    setCurrentWorkoutSession(session);
    await setItem(JSON.stringify(session));
  };

  const renderHeader = () => (
    <>
      <ImageBackground source={logoBlack} className="w-screen h-[30vh]" />
      <View style={[styles.container, spacing.gapLg, spacing.pdDefault]}>
        {value && plans && (
          <DropDownPicker
            rtl
            open={open}
            value={value}
            items={plans}
            theme="DARK"
            setOpen={setOpen}
            setValue={setValue}
            labelStyle={text.textRight}
            listItemLabelStyle={text.textRight}
            onSelectItem={(val) => selectNewWorkoutPlan(val.value as string)}
          />
        )}
        <TouchableOpacity
          style={{ display: "flex", flexDirection: "row-reverse", width: 60 }}
          onPress={() => setOpenTips(true)}
        >
          <Text style={styles.tipsText}>דגשים</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <FlatList
      data={currentWorkoutPlan?.muscleGroups || []}
      ListEmptyComponent={() => (
        <View>
          <Text>No Exercises</Text>
        </View>
      )}
      keyExtractor={(item) => item.muscleGroup}
      ListHeaderComponent={renderHeader}
      renderItem={({ item }) => (
        <View style={[spacing.pdHorizontalSm]}>
          <Text style={[styles.muscleGroupText, text.textRight, fonts.xl]}>{item.muscleGroup}</Text>
          <View style={[spacing.gapLg]}>
            {item.exercises.map((exercise, index) => (
              <ExerciseContainer
                key={currentWorkoutPlan?.planName + "-" + index}
                plan={currentWorkoutPlan?.planName || ""}
                muscleGroup={item.muscleGroup}
                exercise={exercise}
                session={currentWorkoutSession} // Pass down the session
                updateSession={handleUpdateSession} // Handler for recording a set
              />
            ))}
          </View>
        </View>
      )}
      ListFooterComponent={<WorkoutTips openTips={openTips} setOpenTips={setOpenTips} />}
      contentContainerStyle={styles.workoutContainer}
    />
  );
};

export default WorkoutPlan;

const styles = StyleSheet.create({
  headerImage: {
    width: width,
    height: 250,
  },
  container: {
    zIndex: 10,
    width: "100%",
    alignItems: "flex-end",
  },
  tipsText: {
    color: Colors.primary,
    textAlign: "right",
    fontSize: 18,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  workoutContainer: {
    zIndex: 1,
    gap: 12,
  },
  muscleGroupText: {
    color: Colors.light,
    textAlign: "left",
    fontWeight: "bold",
    padding: 10,
  },
});
