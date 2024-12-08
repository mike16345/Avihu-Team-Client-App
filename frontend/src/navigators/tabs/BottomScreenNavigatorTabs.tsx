import NativeIcon from "@/components/Icon/NativeIcon";
import MyDietPlanScreen from "@/screens/MyDietPlanScreen";
import MyProgressScreen from "@/screens/MyProgressScreen";
import { NavigatorTab } from "@/types/navigatorTypes";
import WorkoutPlanStack from "../WorkoutPlanStack";
import BlogScreen from "@/screens/BlogScreen";

const BottomScreenNavigatorTabs: NavigatorTab[] = [
  {
    name: "MyWorkoutPlanPage",
    component: WorkoutPlanStack,
    options: {
      tabBarLabel: "",
      tabBarAccessibilityLabel: "אימונים",

      tabBarIcon: ({ color }) => (
        <NativeIcon library="MaterialCommunityIcons" color={color} name="weight-lifter" size={28} />
      ),
    },
  },
  {
    name: "MyDietPlanPage",
    component: MyDietPlanScreen,
    options: {
      tabBarLabel: "",
      tabBarIcon: ({ color, focused }) => (
        <NativeIcon
          library="MaterialCommunityIcons"
          color={color}
          name={focused ? "food" : "food-outline"}
          size={28}
        />
      ),
    },
  },
  {
    name: "MyProgressScreen",
    component: MyProgressScreen,
    options: {
      tabBarLabel: "",

      tabBarIcon: ({ color }: { color: string }) => (
        <NativeIcon library="MaterialIcons" name="monitor-heart" color={color} size={28} />
      ),
    },
  },
  // {
  //   nameent: "BlogScreen",
  //   compon: BlogScreen,
  //   options: {
  //     tabBarLabel: "",
  //     tabBarIcon: ({ color }: { color: string }) => (
  //       <NativeIcon library="MaterialIcons" name="post-add" color={color} size={28} />
  //     ),
  //   },
  // },
  // {
  //   name: "Profile",
  //   component: BlogScreen,
  //   options: {
  //     tabBarLabel: "",
  //     tabBarIcon: ({ color, focused }) => (
  //       <NativeIcon
  //         library="MaterialIcons"
  //         name={focused ? "person" : "person-outline"}
  //         color={color}
  //         size={28}
  //       />
  //     ),
  //   },
  // },
];

export default BottomScreenNavigatorTabs;
