import MyWorkoutPlanPage from "@/screens/MyWorkoutPlanPage";
import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import MyProgressScreen from "@/screens/MyProgressScreen";
import NativeIcon from "@/components/Icon/NativeIcon";
import { RootStackParamList } from "@/types/navigatorTypes";
import MyDietPlanScreen from "@/screens/MyDietPlanScreen";
import useAnimateBottomBar from "@/hooks/useAnimatedBottomBar";
import { StyleSheet, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { useLayoutStore } from "@/store/layoutStore";
import ResponsiveComponent from "./ResponsiveC";

const Tab = createMaterialBottomTabNavigator<RootStackParamList>();

const BottomTabNavigator = () => {
  const animatedValue = useAnimateBottomBar();
  const { isNavbarOpen } = useLayoutStore();

  return (
    <View className="flex-1 bg-black">
      <Tab.Navigator
        barStyle={[
          styles.barStyle,
          {
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
        inactiveColor={Colors.light}
        activeColor="#10B981"
      >
        <Tab.Screen
          name="MyWorkoutPlanPage"
          component={MyWorkoutPlanPage}
          options={{
            tabBarLabel: "Workout",
            tabBarAccessibilityLabel: "Workout Tab",

            tabBarIcon: ({ color }: { color: string }) => (
              <NativeIcon
                library="MaterialCommunityIcons"
                color={color}
                name="weight-lifter"
                size={28}
              />
            ),
          }}
        />

        <Tab.Screen
          name="MyDietPlanPage"
          component={MyDietPlanScreen}
          options={{
            tabBarLabel: "Diet",
            tabBarIcon: ({ color }: { color: string }) => (
              <NativeIcon library="FontAwesome6" color={color} name="bowl-food" size={28} />
            ),
          }}
        />
        <Tab.Screen
          name="MyProgressScreen"
          component={MyProgressScreen}
          options={{
            tabBarLabel: "Weight ",

            tabBarIcon: ({ color }: { color: string }) => (
              <NativeIcon library="MaterialIcons" name="monitor-weight" color={color} size={28} />
            ),
          }}
        />
        <Tab.Screen
          name="Responsive"
          component={ResponsiveComponent}
          options={{
            tabBarLabel: "Weight ",

            tabBarIcon: ({ color }: { color: string }) => (
              <NativeIcon library="MaterialIcons" name="monitor-weight" color={color} size={28} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({
  barStyle: {
    backgroundColor: Colors.bgSecondary,
  },
});
