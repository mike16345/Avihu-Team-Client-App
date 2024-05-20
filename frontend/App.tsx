import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import BottomBar from "./src/components/Navigators/BottomBar";
import TopBar from "./src/components/Navigators/TopBar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import MainTab from "./src/screens/MainStack";
import "react-native-gesture-handler";
import "./global.css";
import Sidebar from "./src/components/Navigators/Sidebar";
import { useState } from "react";

export default function App() {
  const [isDrawerOpen, setisDrawerOpen] = useState(false);

  return (
    <NavigationContainer>
      <SafeAreaProvider
        initialMetrics={initialWindowMetrics}
        className="flex-1 h-screen  bg-black "
      >
        <MainTab />
        <View className=" absolute top-0  w-screen">
          <TopBar />
        </View>
        <StatusBar style={"light"} />
      </SafeAreaProvider>
    </NavigationContainer>
  );
}
