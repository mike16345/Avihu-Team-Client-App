import RecordedSets from "@/components/WorkoutPlan/RecordedSets";
import MyWorkoutPlanScreen from "@/screens/MyWorkoutPlanPage";

export const stacks = [
  {
    name: "WorkoutPlan",
    title: "אימונים",
    component: MyWorkoutPlanScreen,
  },
  {
    name: "RecordedSets",
    component: RecordedSets,
  },
];
