import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { stacks } from "./stacks/WorkoutPlanStacks";
import RecordExercise from "@/components/WorkoutPlan/RecordExercise/RecordExercise";
import { WorkoutPlanStackParamList } from "@/types/navigatorTypes";

const Stack = createNativeStackNavigator<WorkoutPlanStackParamList>();

const WorkoutPlanStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="WorkoutPlan"
      screenOptions={{
        headerShown: false,
      }}
    >
      {stacks.map((stack) => (
        <Stack.Screen
          key={stack.name}
          options={{ title: stack.title }}
          name={stack.name as keyof WorkoutPlanStackParamList}
          component={stack.component}
        />
      ))}
      <Stack.Screen
        name="RecordExercise"
        component={RecordExercise}
      />
    </Stack.Navigator>

  );
};

export default WorkoutPlanStack;
