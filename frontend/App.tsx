import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import BottomBar from "./src/components/Navbars/BottomBar";
import TopBar from "./src/components/Navbars/TopBar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import "./global.css";
import MainTab from "./src/screens/MainStack";

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaProvider
        initialMetrics={initialWindowMetrics}
        className="flex-1 h-screen  bg-black "
      >
        <MainTab />
        {/* <View className=" absolute top-0  w-screen">
          <TopBar />
        </View> */}
        {/* <View className=" absolute bottom-0  w-screen">
          <BottomBar />
        </View> */}
        <StatusBar style={"light"} />
      </SafeAreaProvider>
    </NavigationContainer>
  );
}
