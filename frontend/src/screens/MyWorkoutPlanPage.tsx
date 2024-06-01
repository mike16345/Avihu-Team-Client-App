import { View } from "react-native";
import WorkoutPlan from "../components/WorkoutPlan/WorkoutPlan";

const MyWorkoutPlanScreen = () => {
  return (
    <View className="h-screen justify-center items-center bg-black">
      <WorkoutPlan />
    </View>
  );
};

export default MyWorkoutPlanScreen;
