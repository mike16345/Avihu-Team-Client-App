import React from "react";
import { HomePage } from "./HomePage";
import MyDietPlanPage from "./MyDietPlanPage";
import MyWorkoutPlanPage from "./MyWorkoutPlanPage";
import VideoGallery from "./VideoGallery";
import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";

const Tab = createMaterialBottomTabNavigator();

// TODO: Change to bottomTab navigator
const MainTab = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomePage}></Tab.Screen>
      <Tab.Screen name="MyDietPlanPage" component={MyDietPlanPage}></Tab.Screen>
      <Tab.Screen name="MyWorkoutPlanPage" component={MyWorkoutPlanPage}></Tab.Screen>
      <Tab.Screen name="VideoGallery" component={VideoGallery}></Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainTab;
