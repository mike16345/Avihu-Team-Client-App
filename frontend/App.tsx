import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import BottomBar from "./src/components/Navbars/BottomBar";
import TopBar from "./src/components/Navbars/TopBar";
import "./global.css";
import { NavigationContainer, StackRouter } from "@react-navigation/native";
import MainStack from "./src/screens/MainStack";

export default function App() {
  return (
    <NavigationContainer>
      <View className="flex-1 h-screen  bg-black ">
        <MainStack />
        <View className=" absolute top-0  w-screen">
          <TopBar />
        </View>
        <View className=" absolute bottom-0  w-screen">
          <BottomBar />
        </View>
        <StatusBar style={"light"} />
      </View>
    </NavigationContainer>
  );
}
