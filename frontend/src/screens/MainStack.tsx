import React from "react";
import { HomePage } from "./HomePage";
import MyDietPlanPage from "./MyDietPlanPage";
import MyWorkoutPlanPage from "./MyWorkoutPlanPage";
import VideoGallery from "./VideoGallery";
import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import IonIcon from "react-native-vector-icons/Ionicons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import ProfileScreen from "./ProfileScreen";
import { Platform } from "react-native";
import { cssInterop, remapProps } from "nativewind";

const Tab = createMaterialBottomTabNavigator();
remapProps(Tab.Navigator, {
  barClass: "barStyle",
});
// TODO: Change to bottomTab navigator
const MainTab = () => {
  return (
    <Tab.Navigator initialRouteName="Home" barClass="bg-black android:pb-8" activeColor="#e91e63">
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialCommunityIcons name="home" color={color} size={28} />
          ),
        }}
      />
      <Tab.Screen
        name="Video Gallery"
        component={VideoGallery}
        options={{
          tabBarLabel: "Videos",
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialCommunityIcons name="video" color={color} size={28} />
          ),
        }}
      />
      <Tab.Screen
        name="Workout"
        component={MyWorkoutPlanPage}
        options={{
          tabBarLabel: "Workout",
          tabBarIcon: ({ color }: { color: string }) => (
            <IonIcon color={color} name="body" size={28} />
          ),
        }}
      />
      <Tab.Screen
        name="Diet"
        component={MyDietPlanPage}
        options={{
          tabBarLabel: "Diet",
          tabBarIcon: ({ color }: { color: string }) => (
            <FontAwesome6 color={color} name="bowl-food" size={28} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialCommunityIcons name="account" color={color} size={28} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTab;
