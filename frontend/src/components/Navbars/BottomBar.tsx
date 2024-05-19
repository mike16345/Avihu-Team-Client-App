import React from "react";
import { View } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import IonIcon from "react-native-vector-icons/Ionicons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import { RootStackParamList } from "../../types/navigatorTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

const BottomBar = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className=" flex-row w-full justify-around ios:pb-8 py-4 items-center bg-gray-800 rounded-t-lg ">
      <AntDesign
        onPress={() => {
          navigation.navigate("Home");
        }}
        style={{ color: "white" }}
        name="home"
        size={28}
      />

      <IonIcon
        onPress={() => {
          navigation.navigate("MyWorkoutPlanPage");
        }}
        style={{ color: "white" }}
        name="body"
        size={28}
      />
      <FontAwesome6
        onPress={() => {
          navigation.navigate("MyDietPlanPage");

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
