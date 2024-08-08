import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GetStartedScreen } from "@/screens/GetStartedScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useUserStore } from "@/store/userStore";
import { useUserApi } from "@/hooks/useUserApi";
import { PaperProvider } from "react-native-paper";
import { LightTheme, DarkTheme } from "@/themes/useAppTheme";
import { Appearance } from "react-native";
import BottomTabNavigator from "@/navigators/BottomTabNavigator";
import Login from "@/components/Login/Login";
import "react-native-gesture-handler";
import "./global.css";
// import { I18nManager } from "react-native";
// Enable RTL
// I18nManager.forceRTL(true);

const Stack = createNativeStackNavigator();

export default function App() {
  const { getItem, removeItem } = useAsyncStorage("isLoggedIn");
  const { getUserById } = useUserApi();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const currentUser = useUserStore((state) => state.currentUser);

  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const checkLoginStatus = async () => {
    const token = await getItem();
    if (token) setIsLoggedIn(true);
  };

  useEffect(() => {
    checkLoginStatus();
    getUserById("665f0b0b00b1a04e8f1c4478").then((user) => setCurrentUser(user));

    return () => {
      removeItem();
    };
  }, []);

  return (
    <NavigationContainer>
      <GestureHandlerRootView>
        <PaperProvider theme={Appearance.getColorScheme() == "dark" ? DarkTheme : LightTheme}>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {isLoggedIn && currentUser ? (
                <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
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
            <StatusBar translucent style="light" />
          </SafeAreaProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}
