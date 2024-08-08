import NativeIcon from "@/components/Icon/NativeIcon";
import MyWorkoutPlanPage from "@/screens/MyWorkoutPlanPage";
import MyDietPlanScreen from "@/screens/MyDietPlanScreen";
import MyProgressScreen from "@/screens/MyProgressScreen";
import { NavigatorTab } from "@/types/navigatorTypes";

const BottomScreenNavigatorTabs: NavigatorTab[] = [
  {
    name: "MyWorkoutPlanPage",
    component: MyWorkoutPlanPage,
    options: {
      tabBarLabel: "Workout",
      tabBarAccessibilityLabel: "Workout Tab",

      tabBarIcon: ({ color }) => (
        <NativeIcon library="MaterialCommunityIcons" color={color} name="weight-lifter" size={28} />
      ),
    },
  },
  {
    name: "MyDietPlanPage",
    component: MyDietPlanScreen,
    options: {
      tabBarLabel: "Diet",
      tabBarIcon: ({ color }: { color: string }) => (
        <NativeIcon library="FontAwesome6" color={color} name="bowl-food" size={28} />
      ),
    },
  },
  {
    name: "MyProgressScreen",
    component: MyProgressScreen,
    options: {
      tabBarLabel: "Weight ",

      tabBarIcon: ({ color }: { color: string }) => (
        <NativeIcon library="MaterialIcons" name="monitor-weight" color={color} size={28} />
      ),
    },
  },
];

export default BottomScreenNavigatorTabs;
