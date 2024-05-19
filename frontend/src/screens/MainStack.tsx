import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomePage } from "./HomePage";
import MyDietPlanPage from "./MyDietPlanPage";
import MyWorkoutPlanPage from "./MyWorkoutPlanPage";
import VideoGallery from "./VideoGallery";

const Stack = createNativeStackNavigator();
// TODO: Change to bottomTab navigator
const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomePage}></Stack.Screen>
      <Stack.Screen name="MyDietPlanPage" component={MyDietPlanPage}></Stack.Screen>
      <Stack.Screen name="MyWorkoutPlanPage" component={MyWorkoutPlanPage}></Stack.Screen>
      <Stack.Screen name="VideoGallery" component={VideoGallery}></Stack.Screen>
    </Stack.Navigator>
  );
};

export default MainStack;
