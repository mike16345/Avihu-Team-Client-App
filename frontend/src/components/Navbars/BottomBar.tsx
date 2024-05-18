import React from "react";
import { View } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import IonIcon from "react-native-vector-icons/Ionicons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

const BottomBar = () => {
  return (
    <View className=" flex-row w-full justify-around ios:pb-8 py-4 items-center bg-gray-800 rounded-lg ">
      <AntDesign
        onPress={() => {
          console.log("go home");
        }}
        style={{ color: "white" }}
        name="home"
        size={28}
      />

      <IonIcon
        onPress={() => {
          console.log("go workout");
        }}
        style={{ color: "white" }}
        name="body"
        size={28}
      />
      <FontAwesome6
        onPress={() => {
          console.log("go eat");
        }}
        style={{ color: "white" }}
        name="bowl-food"
        size={28}
      />
    </View>
  );
};

export default BottomBar;
