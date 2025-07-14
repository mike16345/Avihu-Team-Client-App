import RecordedSets from "@/components/WorkoutPlan/RecordedSets";
import RecordExercise from "@/components/WorkoutPlan/RecordExercise";
import MyWorkoutPlanScreen from "@/screens/MyWorkoutPlanPage";

export const stacks = [
  {
    name: "WorkoutPlan",
    title: "אימונים",
    component: MyWorkoutPlanScreen,
  },
  {
    name: "RecordSet",
    component: RecordExercise,
  },
  {
    name: "RecordedSets",
    component: RecordedSets,
  },
];
