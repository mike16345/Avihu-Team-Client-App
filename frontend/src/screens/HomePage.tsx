import React from "react";
import { View, Text, ImageBackground } from "react-native";
import avihuFlyTrap from "../../assets/avihuFlyTrap.jpeg";

export const HomePage = () => {
  return (
    <View className="flex-1 ">
      <ImageBackground
        className=" w-auto  h-screen items-center justify-center"
        source={avihuFlyTrap}
        style={{}}
      >
        <Text
          className="text-2xl font-bold shadow-lg  text-white text-center z-50"
          style={{
            elevation: 10,
          }}
        >
          Avihu Busheri
        </Text>
      </ImageBackground>
    </View>
  );
};
