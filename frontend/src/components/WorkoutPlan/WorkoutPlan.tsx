import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useState, useEffect } from "react";
import logoBlack from "@assets/avihu/avihu-logo-black.png";
import DropDownPicker, { ValueType } from "react-native-dropdown-picker";
import { ICompleteWorkoutPlan, IWorkoutPlan } from "@/interfaces/Workout";
import WorkoutTips from "./WorkoutTips";
import { Colors } from "@/constants/Colors";
import { useWorkoutPlanApi } from "@/hooks/api/useWorkoutPlanApi";
import ExerciseContainer from "./ExerciseContainer";
import useStyles from "@/styles/useGlobalStyles";
import { useUserStore } from "@/store/userStore";

const width = Dimensions.get("window").width;

const WorkoutPlan = () => {
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<any[] | null>(null);
  const [value, setValue] = useState<ValueType>();
  const [openTips, setOpenTips] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<ICompleteWorkoutPlan>();
  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<IWorkoutPlan | null>(null);

  const { fonts, text, spacing, layout } = useStyles();
  const { getWorkoutPlanByUserId } = useWorkoutPlanApi();
  const { currentUser } = useUserStore();

  const selectNewWorkoutPlan = (planName: string) => {
    const selectedWorkoutPlan = workoutPlan?.workoutPlans.find(
      (plan) => plan.planName === planName
    );

    if (selectedWorkoutPlan) setCurrentWorkoutPlan(selectedWorkoutPlan);
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
  }, [workoutPlan]);

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
        <View>
          <Text style={[styles.muscleGroupText, text.textRight, fonts.xl]}>{item.muscleGroup}</Text>
          {item.exercises.map((exercise, index) => (
            <View style={[spacing.mgHorizontalXs]} key={index}>
              <ExerciseContainer
                plan={currentWorkoutPlan?.planName || ""}
                muscleGroup={item.muscleGroup}
                exercise={exercise}
              />
            </View>
          ))}
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
