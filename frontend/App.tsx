import { StatusBar } from "expo-status-bar";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";

import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserStore } from "@/store/userStore";
import { useUserApi } from "@/hooks/api/useUserApi";
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
  const colorScheme = Appearance.getColorScheme();

  useEffect(() => {
    Appearance.setColorScheme("dark");
    getUserById("665f0b0b00b1a04e8f1c4478")
      .then((user) => {
        setCurrentUser(user);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <PaperProvider theme={colorScheme == "dark" ? CustomDarkTheme : CustomLightTheme}>
      <ThemeProvider>
        <GestureHandlerRootView>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <NavigationContainer theme={colorScheme == "dark" ? DarkTheme : LightTheme}>
              {currentUser && <RootNavigator />}
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
