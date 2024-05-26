import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import CollapsablePlan from "./CollapsablePlan";
import { workoutPlans, workoutPlanToName, workoutTypeToName } from "../../constants/Workouts";
import logoBlack from "../../../assets/avihu/avihu-logo-black.png";
import DropDownPicker from "react-native-dropdown-picker";
import { WorkoutPlans } from "../../enums/WorkoutPlans";
import { WorkoutType } from "../../enums/WorkoutTypes";
import { IWorkout } from "../../interfaces/Workout";

const tips = [
  "כל תחילת אימון הליכה 5 דק לחמם את הגוף",
  "אימון משקולות תמיד יהיה לפני האירובי",
  "בתחילת האימון יש לבצע שני סטים של חימום בתרגיל הראשון",
  "במידה ויש תרגיל שאתם לא מכירים אתם שולחים לי הודעה",
  "מנוחה בין סט לסט 40-60 שניות",
];

const WorkoutPlan = () => {
  const keys = Object.keys(workoutPlans);
  const itms = keys.map((item) => ({
    label: workoutPlanToName(item),
    value: item,
  }));

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(itms);
  const [value, setValue] = useState(itms[0].value);

  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<Record<WorkoutType, IWorkout[]>>(
    workoutPlans[Number(keys[0]) as WorkoutPlans]
  );

  return (
    <View className="flex-1">
      <ImageBackground source={logoBlack} className="w-screen h-[30vh] items-center " />
      <View
        style={{
          width: "90%",
          padding: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <DropDownPicker
          style={{ width: "50%" }}
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
        <TouchableOpacity onPress={() => console.log("open tips")}>
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
    </View>
  );
};

export default WorkoutPlan;

const styles = StyleSheet.create({});
