import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import { RootStackParamList } from "@/types/navigatorTypes";
import useAnimateBottomBar from "@/hooks/useAnimatedBottomBar";
import { View } from "react-native";
import { useLayoutStore } from "@/store/layoutStore";
import BottomScreenNavigatorTabs from "./tabs/BottomScreenNavigatorTabs";
import useStyles from "@/styles/useGlobalStyles";

const Tab = createMaterialBottomTabNavigator<RootStackParamList>();

const BottomTabNavigator = () => {
  const { layout, colors } = useStyles();

  const animatedValue = useAnimateBottomBar();
  const { isNavbarOpen } = useLayoutStore();

  return (
    <View style={[layout.flex1, colors.background]}>
      <Tab.Navigator
        barStyle={[
          {
            ...colors.background,
            opacity: animatedValue,
            pointerEvents: isNavbarOpen ? "auto" : "none",
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
        initialRouteName="MyWorkoutPlanPage"
        activeIndicatorStyle={{
          ...layout.center,
          width: 45,
          height: 40,

          backgroundColor: colors.textOnBackground.color,

          padding: 8,
          borderRadius: 99,
        }}
        inactiveColor={colors.textOnBackground.color}
        activeColor={colors.textPrimary.color}
      >
        {BottomScreenNavigatorTabs.map((tab) => {
          return (
            <Tab.Screen
              key={tab.name}
              name={tab.name}
              component={tab.component}
              options={{ ...tab.options }}
            />
          );
        })}
      </Tab.Navigator>
    </View>
  );
};

export default BottomTabNavigator;
