import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { workoutPlans, workoutPlanToName } from "@/constants/Workouts";
import logoBlack from "@assets/avihu/avihu-logo-black.png";
import DropDownPicker, { ItemType, ValueType } from "react-native-dropdown-picker";
import { WorkoutPlans } from "@/enums/WorkoutPlans";
import { WorkoutType } from "@/enums/WorkoutTypes";
import { ICompleteWorkoutPlan, IMuscleGroupWorkouts, IWorkout, IWorkoutPlan } from "@/interfaces/Workout";
import WorkoutTips from "./WorkoutTips";
import Workout from "./Workout";
import useHideTabBarOnScroll from "@/hooks/useHideTabBarOnScroll";
import { Colors } from "@/constants/Colors";
import { useWorkoutPlanApi } from "@/hooks/useWorkoutPlanApi";
import { useUserStore } from "@/store/userStore";

const WorkoutPlan = () => {
  

  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<ItemType[]|null>(null);
  const [value, setValue] = useState<ValueType>();
  const [openTips, setOpenTips] = useState(false);
  const scrollViewRef = useRef(null);
  const [workoutPlan,setWorkoutPlan]=useState<ICompleteWorkoutPlan>()

  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<IWorkoutPlan>();

  const { handleScroll } = useHideTabBarOnScroll();
  const{getWorkoutPlanByUserId}=useWorkoutPlanApi()
  const {currentUser}=useUserStore()

  useEffect(()=>{
    getWorkoutPlanByUserId(`665f0b0b00b1a04e8f1c4478`)
    .then(res=>{
      setWorkoutPlan(res)})
    .catch(err=>console.log(err))
  },[])

  useEffect(()=>{
    if (workoutPlan) {
     const plans = workoutPlan.workoutPlans.map(workout => {
      return { label: workout.planName, value: workout.planName };
    });
      setPlans(plans)
      setValue(plans[0].label)
      console.log(workoutPlan.workoutPlans[0]);
      
      setCurrentWorkoutPlan(workoutPlan.workoutPlans[0])

    }
  },[workoutPlan])


  return (
    <ScrollView style={styles.scrollView} ref={scrollViewRef} onScroll={handleScroll} scrollEventThrottle={16}>
      <ImageBackground source={logoBlack} style={styles.headerImage} />
      <View style={styles.container}>
        { value && plans && currentWorkoutPlan &&
        <DropDownPicker
          ltr
          open={open}
          value={value}
          items={plans}
          theme="DARK"
          setOpen={setOpen}
          setValue={setValue}
          setItems={setPlans}
          labelStyle={{ textAlign: "left" }}
          listItemLabelStyle={{ textAlign: "left" }}
          onChangeValue={(val) => {
            if (!val) return;
            const key = Number(val) as WorkoutPlans;
            setCurrentWorkoutPlan(plans[key]);
          }}
        />
}
        <TouchableOpacity
          style={{ display: "flex", flexDirection: "row-reverse", width: 60 }}
          onPress={() => setOpenTips(true)}
        >
          <Text style={styles.tipsText}>דגשים</Text>
        </TouchableOpacity>
      </View>

      <View>
       
            <View style={styles.workoutContainer}>
              {currentWorkoutPlan && currentWorkoutPlan.muscleGroups.map((muscleGroup, index) => {
                 
                return <View>
                 <Text>{muscleGroup.muscleGroup}</Text>
                {muscleGroup.exercises.map(exercise=>(
                  <Workout workout={exercise} key={index} />
                ))}
                </View>
})}
            </View>
      </View>
      <WorkoutTips openTips={openTips} setOpenTips={setOpenTips} />
    </ScrollView>
  );
};

export default WorkoutPlan;

const styles = StyleSheet.create({
  scrollView:{
    width:`100%`,
    direction:`rtl`,
  },
  headerImage: {
    width: "100%",
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    zIndex: 10,
    width: "100%",
    alignItems: "flex-end",
    padding: 12,
    gap: 20,
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
    padding: 4,
    gap: 12,
  },
});
