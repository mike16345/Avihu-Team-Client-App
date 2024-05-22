import React from "react";
import { HomePage } from "./HomePage";
import MyDietPlanPage from "./MyDietPlanPage";
import MyWorkoutPlanPage from "./MyWorkoutPlanPage";
import VideoGallery from "./VideoGallery";
import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import MyProgressScreen from "./MyProgressScreen";
import NativeIcon from "../components/Icon/NativeIcon";

const Tab = createMaterialBottomTabNavigator();

const MainTab = () => {
  return (
    <Tab.Navigator
      barStyle={{ backgroundColor: "#1F2937" }}
      initialRouteName="Home"
      inactiveColor="white"
      activeColor="#10B981"
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }: { color: string }) => {
            return (
              <NativeIcon library="MaterialCommunityIcons" name="home" color={color} size={28} />
            );
          },
        }}
      />
      <Tab.Screen
        name="Video Gallery"
        component={VideoGallery}
        options={{
          tabBarLabel: "Videos",
          tabBarIcon: ({ color }: { color: string }) => (
            <NativeIcon library="MaterialCommunityIcons" name="video" color={color} size={28} />
          ),
        }}
      />
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
        name="Diet"
        component={MyDietPlanPage}
        options={{
          tabBarLabel: "Diet",
          tabBarIcon: ({ color }: { color: string }) => (
            <NativeIcon library="FontAwesome6" color={color} name="bowl-food" size={28} />
          ),
        }}
      />
      <Tab.Screen
        name="MyWeight"
        component={MyProgressScreen}
        options={{
          tabBarLabel: "Weight ",

          tabBarIcon: ({ color }: { color: string }) => (
            <NativeIcon library="MaterialIcons" name="monitor-weight" color={color} size={28} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTab;
