import React from "react";
import { View, Text, ImageBackground, Dimensions, StatusBar, TouchableOpacity } from "react-native";
import avihuFlyTrap from "../../assets/avihuFlyTrap.jpeg";
import { moderateScale } from "react-native-size-matters";
import { Button } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigatorTypes";

interface HomePageProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, "Home">;
}

export const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  return (
    <View className="flex-1 items-center ">
      <ImageBackground
        className="items-center justify-center z-0"
        source={avihuFlyTrap}
        style={{
          width: moderateScale(350, 2),
          height: moderateScale(675, 2),
          paddingTop: StatusBar.currentHeight,
        }}
      ></ImageBackground>
      <View className="absolute  flex-1  h-screen w-screen bg-black opacity-40 z-40"></View>
      <View className="absolute top-1/2 items-center z-[100] justify-center gap-2">
        <Text className="text-3xl font-black text-white ">Avihu Busheri</Text>
        <TouchableOpacity onPress={() => navigation!.navigate("MyWorkoutPlanPage")} className="">
          <Text className="bg-emerald-300 p-3 rounded text-black font-bold ">Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
