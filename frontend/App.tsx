import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import TopBar from "./src/components/Navigators/TopBar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import MainTab from "./src/screens/MainStack";
import "react-native-gesture-handler";
import "./global.css";
import Login from "./src/components/Login/Login";
import { useState } from "react";
import MyDietPlanPage from "./src/pages/MyDietPlanPage";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      <SafeAreaProvider
        initialMetrics={initialWindowMetrics}
        className="flex-1 h-screen  bg-black "
      >
        {/* {isLoggedIn && <MainTab />} */}
        {/* <View className=" absolute top-0  w-screen">
          <TopBar />
        </View> */}
        {/* {!isLoggedIn && <Login setIsLoggedIn={setIsLoggedIn} />} */}
        <MyDietPlanPage />
        <StatusBar style={"light"} />
      </SafeAreaProvider>
    </NavigationContainer>
  );
}
