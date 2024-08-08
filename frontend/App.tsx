import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserStore } from "@/store/userStore";
import { useUserApi } from "@/hooks/useUserApi";
import { adaptNavigationTheme, PaperProvider } from "react-native-paper";
import { LightTheme as CustomLightTheme, DarkTheme, ThemeProvider } from "@/themes/useAppTheme";
import { Appearance } from "react-native";
import RootNavigator from "@/navigators/RootNavigator";
import "react-native-gesture-handler";
import "./global.css";

// import { I18nManager } from "react-native";
// Enable RTL
// I18nManager.forceRTL(true);

const { LightTheme } = adaptNavigationTheme({ reactNavigationLight: DefaultTheme });

export default function App() {
  const { getUserById } = useUserApi();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
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
    <PaperProvider theme={colorScheme == "dark" ? DarkTheme : CustomLightTheme}>
      <ThemeProvider>
        <GestureHandlerRootView>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <NavigationContainer theme={LightTheme}>
              <RootNavigator />
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
