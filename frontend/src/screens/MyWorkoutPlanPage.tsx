import { useEffect } from "react";
import WorkoutPlan from "../components/WorkoutPlan/WorkoutPlan";
import { useNavigation } from "@react-navigation/native";

const MyWorkoutPlanScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "אימונים",
    });
  }, [navigation]);

  return <WorkoutPlan />;
};

export default MyWorkoutPlanScreen;
