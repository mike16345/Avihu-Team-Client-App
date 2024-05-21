import { View, Text } from "react-native";
import React from "react";
import { Avatar } from "@rneui/themed";
import Entypo from "react-native-vector-icons/Entypo";

export default function TopBar() {
  return (
    <View className="flex flex-row p-2  bg-gray-800 h-[85px] w-full items-end justify-between   ">
      <Avatar title="AB" size={"small"} rounded />
      <Text className="text-2xl font-bold text-emerald-300">AB</Text>
      <Entypo
        onPress={() => {
          console.log("hello");
        }}
        style={{ color: "white" }}
        name="menu"
        size={28}
      />
    </View>
  );
}
