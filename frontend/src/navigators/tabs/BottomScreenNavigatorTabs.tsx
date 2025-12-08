import MyDietPlanScreen from "@/screens/MyDietPlanScreen";
import { NavigatorTab } from "@/types/navigatorTypes";
import WorkoutPlanStack from "../WorkoutPlanStack";
import Icon from "@/components/Icon/Icon";
import HomeScreen from "@/screens/HomeScreen";
import ArticleStack from "../ArticleStack";
import { useIconLayout } from "@/context/useiconLayout";
import { View } from "react-native";

const ICON_HEIGHT = 24;
const ICON_WIDTH = 24;

const BottomScreenNavigatorTabs: NavigatorTab[] = [
  {
    name: "MyWorkoutPlanPage",
    component: WorkoutPlanStack,
    options: {
      tabBarLabel: "",
      tabBarAccessibilityLabel: "אימונים",
      tabBarIcon: ({ color }) => {
        const { setIconLayout } = useIconLayout();
        return (
          <View
            ref={(ref) => {
              if (ref) {
                ref.measureInWindow((x, y, width) => {
                  setIconLayout("MyWorkoutPlanPage", x + width / 2);
                });
              }
            }}
          >
            <Icon color={color} name="dumbbell" height={ICON_HEIGHT} width={ICON_WIDTH} />
          </View>
        );
      },
    },
  },
  {
    name: "ChatTab",
    component: HomeScreen,
    options: {
      tabBarIcon: ({ color }) => {
        const { setIconLayout } = useIconLayout();
        return (
          <View
            ref={(ref) => {
              if (ref) {
                ref.measureInWindow((x, y, width) => {
                  setIconLayout("ChatTab", x + width / 2);
                });
              }
            }}
          >
            <Icon color={color} name="chat" height={ICON_HEIGHT} width={ICON_WIDTH} />
          </View>
        );
      },
    },
    listeners: ({ navigation }) => ({
      tabPress: (e: any) => {
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
      tabBarIcon: ({ color }) => {
        const { setIconLayout } = useIconLayout();
        return (
          <View
            ref={(ref) => {
              if (ref) {
                ref.measureInWindow((x, y, width) => {
                  setIconLayout("Home", x + width / 2);
                });
              }
            }}
          >
            <Icon color={color} name="home" height={ICON_HEIGHT} width={ICON_WIDTH} />
          </View>
        );
      },
    },
  },
  {
    name: "MyDietPlanPage",
    component: MyDietPlanScreen,
    options: {
      tabBarLabel: "",
      tabBarIcon: ({ color }) => {
        const { setIconLayout } = useIconLayout();
        return (
          <View
            ref={(ref) => {
              if (ref) {
                ref.measureInWindow((x, y, width) => {
                  setIconLayout("MyDietPlanPage", x + width / 2);
                });
              }
            }}
          >
            <Icon color={color} name="chefHat" height={ICON_HEIGHT} width={ICON_WIDTH} />
          </View>
        );
      },
    },
  },
  {
    name: "ArticleScreen",
    component: ArticleStack,
    options: {
      tabBarLabel: "",
      tabBarIcon: ({ color }) => {
        const { setIconLayout } = useIconLayout();
        return (
          <View
            ref={(ref) => {
              if (ref) {
                ref.measureInWindow((x, y, width) => {
                  setIconLayout("ArticleScreen", x + width / 2);
                });
              }
            }}
          >
            <Icon color={color} name="sideBar" height={ICON_HEIGHT} width={ICON_WIDTH} />
          </View>
        );
      },
    },
  },
];

export default BottomScreenNavigatorTabs;
