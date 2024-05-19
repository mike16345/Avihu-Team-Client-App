import React from "react";
import { View, Text } from "react-native";

export const HomePage = () => {
  return (
    <View className="h-screen justify-center items-center bg-black [&>*]:text-white [&>*]:text-2xl">
      <Text className="text-white">HomePage</Text>
    </View>
  );
};
