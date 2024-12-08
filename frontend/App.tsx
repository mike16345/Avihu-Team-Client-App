import "react-native-reanimated";
import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";

import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { adaptNavigationTheme, PaperProvider } from "react-native-paper";
import {
  LightTheme as CustomLightTheme,
  DarkTheme as CustomDarkTheme,
  ThemeProvider,
} from "@/themes/useAppTheme";
import { Appearance, View } from "react-native";
import RootNavigator from "@/navigators/RootNavigator";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { BOTTOM_BAR_HEIGHT } from "@/constants/Constants";
import { useFonts } from "expo-font";
import UserDrawer from "@/components/User/UserDrawer";

// import { I18nManager } from "react-native";
// Enable RTL
// I18nManager.forceRTL(true);

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const queryClient = new QueryClient();
export default function App() {
  const colorScheme = Appearance.getColorScheme();
  const [loaded, error] = useFonts({
    Assistant: require("./assets/fonts/Assistant-VariableFont_wght.ttf"),
  });
  if (!loaded) return;

  return (
    <PaperProvider
      theme={/* colorScheme == "dark" ? CustomDarkTheme : CustomLightTheme */ CustomDarkTheme}
    >
      <ThemeProvider>
        <GestureHandlerRootView>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <QueryClientProvider client={queryClient}>
              <NavigationContainer theme={DarkTheme}>
                <RootNavigator />
                <StatusBar key={colorScheme} translucent style={"light"} />
                <Toast position="bottom" bottomOffset={BOTTOM_BAR_HEIGHT} />
                <UserDrawer />
              </NavigationContainer>
            </QueryClientProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </PaperProvider>
  );
}
