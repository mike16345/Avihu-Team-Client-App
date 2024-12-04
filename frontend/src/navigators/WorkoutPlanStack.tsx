import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { stacks } from "./stacks/WorkoutPlanStacks";
import useColors from "@/styles/useColors";

const Stack = createNativeStackNavigator();

const WorkoutPlanStack = () => {
  const { background } = useColors();

  return (
    <Stack.Navigator
      initialRouteName="WorkoutPlan"
      screenOptions={{
        navigationBarHidden: false,
        headerTitleAlign: "center",
        headerTitleStyle: { fontSize: 18 },
        headerStyle: background,
      }}
    >
      {stacks.map((stack) => (
        <Stack.Screen
          key={stack.name}
          options={{ title: stack.title }}
          name={stack.name}
          component={stack.component}
        />
      ))}
    </Stack.Navigator>
  );
};

export default WorkoutPlanStack;
