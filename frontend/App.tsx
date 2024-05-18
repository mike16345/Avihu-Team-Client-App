import { StatusBar } from "expo-status-bar";
import { Text, View, Dimensions, SafeAreaView } from "react-native";
import "./global.css";
import BottomBar from "./src/components/Navbars/BottomBar";
import TopBar from "./src/components/Navbars/TopBar";

export default function App() {
  return (
    <View className="flex-1  items-center justify-center  bg-black ">
      <View className=" absolute top-0  w-screen">
        <TopBar />
      </View>
      <View className=" absolute bottom-0  w-screen">
        <BottomBar />
      </View>
      <Text className="text-white text-xl ">It indeed works!</Text>
      <StatusBar style={"light"} />
    </View>
  );
}
