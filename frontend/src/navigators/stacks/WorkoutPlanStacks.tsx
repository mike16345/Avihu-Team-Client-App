import RecordExerciseNew from "@/components/WorkoutPlan/RecordExerciseRefactor";
import MyWorkoutPlanScreen from "@/screens/MyWorkoutPlanPage";

export const stacks = [
  {
    name: "WorkoutPlan",
    title: "אימונים",
    component: MyWorkoutPlanScreen,
  },
  {
    name: "RecordSet",
    component: RecordExerciseNew,
  },
];
