import { StatusBar } from "expo-status-bar";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";

import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserStore } from "@/store/userStore";
import { useUserApi } from "@/hooks/useUserApi";
import { adaptNavigationTheme, PaperProvider } from "react-native-paper";
import {
  LightTheme as CustomLightTheme,
  DarkTheme as CustomDarkTheme,
  ThemeProvider,
} from "@/themes/useAppTheme";
import { Appearance } from "react-native";
import RootNavigator from "@/navigators/RootNavigator";
import "react-native-gesture-handler";
import "./global.css";
import Loader from "@/components/ui/loaders/Loader";

// import { I18nManager } from "react-native";
// Enable RTL
// I18nManager.forceRTL(true);

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export default function App() {
  const { getUserById } = useUserApi();
  const { currentUser, setCurrentUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = Appearance.getColorScheme();

  useEffect(() => {
    Appearance.setColorScheme("dark");
    setIsLoading(true);
    getUserById("66eb21052c9fd96253c299ff")
      .then((user) => {
        setCurrentUser(user);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PaperProvider
      theme={/* colorScheme == "dark" ? CustomDarkTheme : CustomLightTheme */ CustomDarkTheme}
    >
      <ThemeProvider>
        <GestureHandlerRootView>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <NavigationContainer theme={colorScheme == "dark" ? DarkTheme : LightTheme}>
              {isLoading ? <Loader /> : currentUser && <RootNavigator />}
              <StatusBar
                key={colorScheme}
                translucent
                style={colorScheme == "dark" ? "light" : "dark"}
              />
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </PaperProvider>
  );
}
