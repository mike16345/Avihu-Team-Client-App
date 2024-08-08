import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import { RootStackParamList } from "@/types/navigatorTypes";
import useAnimateBottomBar from "@/hooks/useAnimatedBottomBar";
import { View } from "react-native";
import { useLayoutStore } from "@/store/layoutStore";
import { useLayoutStyles } from "@/styles/useLayoutStyles";
import { useThemeContext } from "@/themes/useAppTheme";
import BottomScreenNavigatorTabs from "./tabs/BottomScreenNavigatorTabs";

const Tab = createMaterialBottomTabNavigator<RootStackParamList>();

const BottomTabNavigator = () => {
  const { theme } = useThemeContext();

  const layoutStyles = useLayoutStyles();

  const animatedValue = useAnimateBottomBar();
  const { isNavbarOpen } = useLayoutStore();

  return (
    <View style={[layoutStyles.flex1, { backgroundColor: theme.colors.background }]}>
      <Tab.Navigator
        barStyle={[
          {
            backgroundColor: theme.colors.background,
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
          ...layoutStyles.center,
          width: 45,
          height: 40,

          backgroundColor: theme.colors.onBackground,

          padding: 8,
          borderRadius: 99,
        }}
        inactiveColor={theme.colors.onBackground}
        activeColor={theme.colors.primary}
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
