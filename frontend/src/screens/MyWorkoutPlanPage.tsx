import { View, Text } from "react-native";
import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigatorTypes";
import { RouteProp } from "@react-navigation/native";

interface MyWorkoutPlanPageProps {
  navigation: NativeStackNavigationProp<RootStackParamList, "MyWorkoutPlanPage">;
  route: RouteProp<RootStackParamList, "MyWorkoutPlanPage">;
}

const MyWorkoutPlanPage: React.FC<MyWorkoutPlanPageProps> = ({ navigation, route }) => {
  const { id } = route.params;
  console.log("id ", id);
  return (
    <View className="h-screen justify-center items-center bg-black">
      <Text className="text-white">MyWorkoutPlanPage</Text>
    </View>
  );
};

export default MyWorkoutPlanPage;
