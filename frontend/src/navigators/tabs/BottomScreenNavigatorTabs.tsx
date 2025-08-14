import MyDietPlanScreen from "@/screens/MyDietPlanScreen";
import MyProgressScreen from "@/screens/MyProgressScreen";
import { NavigatorTab } from "@/types/navigatorTypes";
import WorkoutPlanStack from "../WorkoutPlanStack";
import BlogScreen from "@/screens/BlogScreen";
import Icon from "@/components/Icon/Icon";

const BottomScreenNavigatorTabs: NavigatorTab[] = [
  {
    name: "MyWorkoutPlanPage",
    component: WorkoutPlanStack,
    options: {
      tabBarLabel: "",
      tabBarAccessibilityLabel: "אימונים",

      tabBarIcon: ({ color }) => <Icon color={color} name="dumbbell" height={45} />,
    },
  },
  {
    name: "MyDietPlanPage",
    component: MyDietPlanScreen,
    options: {
      tabBarLabel: "",
      tabBarIcon: ({ color }) => <Icon color={color} name="chat" height={45} />,
    },
  },
  {
    name: "MyProgressScreen",
    component: MyProgressScreen,
    options: {
      tabBarLabel: "",

      tabBarIcon: ({ color }: { color: string }) => <Icon color={color} name="home" height={45} />,
    },
  },
  {
    name: "BlogScreen",
    component: BlogScreen,
    options: {
      tabBarLabel: "",
      tabBarIcon: ({ color }: { color: string }) => (
        <Icon color={color} name="chefHat" height={45} />
      ),
    },
  },
  {
    name: "EmailScreen",
    component: BlogScreen,
    options: {
      tabBarLabel: "",
      tabBarIcon: ({ color }: { color: string }) => (
        <Icon color={color} name="sideBar" height={45} />
      ),
    },
  },
];

export default BottomScreenNavigatorTabs;
