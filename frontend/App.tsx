import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import BottomTabNavigator from "./src/Navigators/BottomTabNavigator";
import "react-native-gesture-handler";
import "./global.css";
import Login from "./src/components/Login/Login";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GetStartedScreen } from "./src/screens/GetStartedScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { getItem } = useAsyncStorage("isLoggedIn");

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await getItem();
      console.log(token);
      if (token) {
        setIsLoggedIn(true);
      }
    };
    checkLoginStatus();
  }, []);

  return (
    <NavigationContainer>
      <GestureHandlerRootView className="flex-1">
        <SafeAreaProvider
          initialMetrics={initialWindowMetrics}
          className="flex-1 h-screen bg-black"
        >
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
              <>
                <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
              </>
            ) : (
              <>
                <Stack.Screen name="HomePage" component={GetStartedScreen} />
                <Stack.Screen
                  children={() => <Login setIsLoggedIn={setIsLoggedIn} />}
                  name="LoginScreen"
                />
              </>
            )}
          </Stack.Navigator>
          <StatusBar style="light" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}
