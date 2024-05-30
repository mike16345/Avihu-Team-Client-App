import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import CollapsablePlan from "./CollapsablePlan";
import { workoutPlans, workoutPlanToName, workoutTypeToName } from "@/constants/Workouts";
import logoBlack from "@assets/avihu/avihu-logo-black.png";
import DropDownPicker from "react-native-dropdown-picker";
import { WorkoutPlans } from "@/enums/WorkoutPlans";
import { WorkoutType } from "@/enums/WorkoutTypes";
import { IWorkout } from "@/interfaces/Workout";
import WorkoutTips from "./WorkoutTips";

const WorkoutPlan = () => {
  const keys = Object.keys(workoutPlans);
  const itms = keys.map((item) => ({
    label: workoutPlanToName(item),
    value: item,
  }));

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(itms);
  const [value, setValue] = useState(itms[0].value);
  const [openTips, setOpenTips] = useState(false);

  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<Record<WorkoutType, IWorkout[]>>(
    workoutPlans[Number(keys[0]) as WorkoutPlans]
  );

  return (
    <View>
      <ImageBackground source={logoBlack} className="w-screen h-[30vh] items-center " />
      <View
        style={{
          width: "100%",
          padding: 12,
          gap: 20,
        }}
      >
        <DropDownPicker
          rtl
          open={open}
          value={value}
          items={items}
          theme="DARK"
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          onChangeValue={(val) => {
            if (!val) return;
            const key = Number(val) as WorkoutPlans;
            setCurrentWorkoutPlan(workoutPlans[key]);
          }}
        />
        <TouchableOpacity onPress={() => setOpenTips(true)}>
          <Text className=" text-emerald-300 text-lg font-bold underline">דגשים</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {Object.keys(currentWorkoutPlan).map((item, i) => {
          const workoutType = Number(item) as WorkoutType;

          return (
            <CollapsablePlan
              key={i}
              title={workoutTypeToName(workoutType)}
              item={currentWorkoutPlan[workoutType]}
            />
          );
        })}
      </ScrollView>
      <WorkoutTips openTips={openTips} setOpenTips={setOpenTips} />
    </View>
  );
};

export default WorkoutPlan;

const styles = StyleSheet.create({});
