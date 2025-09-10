import MyDietPlanScreen from "@/screens/MyDietPlanScreen";
import { NavigatorTab } from "@/types/navigatorTypes";
import WorkoutPlanStack from "../WorkoutPlanStack";
import BlogScreen from "@/screens/BlogScreen";
import Icon from "@/components/Icon/Icon";
import HomeScreen from "@/screens/HomeScreen";

const ICON_HEIGHT = 24;
const ICON_WIDTH = 24;

const BottomScreenNavigatorTabs: NavigatorTab[] = [
  {
    name: "MyWorkoutPlanPage",
    component: WorkoutPlanStack,
    options: {
      tabBarLabel: "",
      tabBarAccessibilityLabel: "אימונים",
      tabBarIcon: ({ color }) => (
        <Icon color={color} name="dumbbell" height={ICON_HEIGHT} width={ICON_WIDTH} />
      ),
    },
  },
  {
    name: "ChatTab",
    component: HomeScreen,
    options: {
      tabBarIcon: ({ color }) => (
        <Icon color={color} name="chat" height={ICON_HEIGHT} width={ICON_WIDTH} />
      ),
    },
    listeners: ({ navigation }) => ({
      tabPress: (e) => {
        e.preventDefault();

        navigation.navigate("Chat");
      },
    }),
  },
  {
    name: "Home",
    component: HomeScreen,
    options: {
      tabBarLabel: "",
      tabBarIcon: ({ color }: { color: string }) => (
        <Icon color={color} name="home" height={ICON_HEIGHT} width={ICON_WIDTH} />
      ),
    },
  },
  {
    name: "MyDietPlanPage",
    component: MyDietPlanScreen,
    options: {
      tabBarLabel: "",
      tabBarIcon: ({ color }: { color: string }) => (
        <Icon color={color} name="chefHat" height={ICON_HEIGHT} width={ICON_WIDTH} />
      ),
    },
  },
  {
    name: "BlogScreen",
    component: BlogScreen,
    options: {
      tabBarLabel: "",
      tabBarIcon: ({ color }: { color: string }) => (
        <Icon color={color} name="sideBar" height={ICON_HEIGHT} width={ICON_WIDTH} />
      ),
    },
  },
];

export default BottomScreenNavigatorTabs;
