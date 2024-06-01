import React from "react";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import avihuFlyTrap from "@assets/avihuFlyTrap.jpeg";
import { moderateScale } from "react-native-size-matters";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigatorTypes";
import { StatusBar } from "expo-status-bar";

interface GetStartedScreenProps {
  navigation?: NativeStackNavigationProp<RootStackParamList, "Home">;
}

export const GetStartedScreen: React.FC<GetStartedScreenProps> = ({ navigation }) => {
  return (
    <View className="flex-1 items-center justify-center">
      <StatusBar hidden />
      <ImageBackground
        className="items-center justify-center z-0"
        source={avihuFlyTrap}
        style={{
          width: moderateScale(350, 2),
          height: moderateScale(700, 2),
        }}
      ></ImageBackground>
      <View className="absolute  flex-1  h-screen w-screen bg-black opacity-40 z-40"></View>
      <View className="absolute top-1/2 items-center z-[100] justify-center gap-2">
        <Text className="text-3xl font-black text-white ">Avihu Busheri</Text>
        <TouchableOpacity onPress={() => navigation!.navigate("LoginScreen")}>
          <Text className="bg-emerald-300 p-3 rounded text-black font-bold ">Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
