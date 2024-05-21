import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import TopBar from "./src/components/Navigators/TopBar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import MainTab from "./src/screens/MainStack";
import "react-native-gesture-handler";
import "./global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <NavigationContainer>
      <GestureHandlerRootView className=" flex-1">
        <SafeAreaProvider
          initialMetrics={initialWindowMetrics}
          className="flex-1 h-screen  bg-black "
        >
          <MainTab />
          {/* <View className=" absolute top-0  w-screen">
          <TopBar />
        </View> */}
          <StatusBar style={"light"} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}
