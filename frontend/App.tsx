import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import MainTab from "./src/screens/MainStack";
import "react-native-gesture-handler";
import "./global.css";
import Login from "./src/components/Login/Login";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      <GestureHandlerRootView className=" flex-1">
        <SafeAreaProvider
          initialMetrics={initialWindowMetrics}
          className="flex-1 h-screen  bg-black "
        >
          <MainTab />
          {isLoggedIn && <MainTab />}
          {!isLoggedIn && <Login setIsLoggedIn={setIsLoggedIn} />}
          <StatusBar style={"light"} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}
