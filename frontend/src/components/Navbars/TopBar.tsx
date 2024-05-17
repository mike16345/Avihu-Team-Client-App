import { View, Text } from "react-native";
import React from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import { Avatar } from "@rneui/themed";
import Entypo from "react-native-vector-icons/Entypo";

export default function TopBar() {
  return (
    <View className="flex flex-row p-2  bg-gray-800 h-[100px] w-full items-end justify-between  rounded-lg ">
      <Entypo
        onPress={() => {
          console.log("go home");
        }}
        style={{ color: "white" }}
        name="menu"
        size={28}
      />
      <Text className="text-2xl font-bold text-emerald-300">AB</Text>
      <Avatar title="AB" size={"small"} rounded />
    </View>
  );
}
