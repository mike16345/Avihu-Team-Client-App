import RecordedSets from "@/components/WorkoutPlan/RecordedSets";
import RecordExercise from "@/components/WorkoutPlan/RecordExercise";
import ArticleScreen from "@/screens/ArticleScreen";

export const stacks = [
  {
    name: "Articles",
    component: ArticleScreen,
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
