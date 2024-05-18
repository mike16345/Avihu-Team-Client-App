import { View, Text } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomBar from "../components/Navbars/BottomBar";
import TopBar from "../components/Navbars/TopBar";
import { HomePage } from "./HomePage";
import MyDietPlanPage from "./MyDietPlanPage";
import MyWorkoutPlanPage from "./MyWorkoutPlanPage";
import VideoGallery from "./VideoGallery";

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomePage}></Stack.Screen>
      <Stack.Screen
        name="MyDietPlanPage"
        component={MyDietPlanPage}
      ></Stack.Screen>
      <Stack.Screen
        name="MyWorkoutPlanPage"
        component={MyWorkoutPlanPage}
      ></Stack.Screen>
      <Stack.Screen name="VideoGallery" component={VideoGallery}></Stack.Screen>
    </Stack.Navigator>
  );
};

export default MainStack;
