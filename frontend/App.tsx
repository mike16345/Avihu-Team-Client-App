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
import { DarkTheme as CustomDarkTheme, ThemeProvider } from "@/themes/useAppTheme";
import { Appearance, I18nManager, Platform, View } from "react-native";
import RootNavigator from "@/navigators/RootNavigator";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import Toast from "react-native-toast-message";
import { BOTTOM_BAR_HEIGHT } from "@/constants/Constants";
import { useFonts } from "expo-font";
import UserDrawer from "@/components/User/UserDrawer";
import Update from "@/hooks/useUpdates";
import persister from "@/QueryClient/queryPersister";
import queryClient from "@/QueryClient/queryClient";
import { useOneTimeRTLFix } from "@/hooks/useEnsureRTL";
import Sandbox from "@/screens/Sandbox";
import { toastConfig } from "@/config/toastConfig";

const { DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export default function App() {
  const ready = useOneTimeRTLFix();
  const colorScheme = Appearance.getColorScheme();
  const [loaded] = useFonts({
    Assistant: require("./assets/fonts/Assistant-VariableFont_wght.ttf"),
    Brutalist: require("./assets/fonts/TelAviv-BrutalistLight.ttf"),
  });

  const direction = Platform.OS == "ios" ? { direction: "rtl" } : {};

  if (!loaded || !ready) return;

  return (
    <PaperProvider theme={CustomDarkTheme}>
      <ThemeProvider>
        <GestureHandlerRootView>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <View style={[direction]}>
              {/*  <PersistQueryClientProvider
              client={queryClient}
              persistOptions={{ persister: persister }}
            >
              <NavigationContainer theme={DarkTheme}>
                <RootNavigator />
                <StatusBar key={colorScheme} translucent style={"light"} />
                <Toast position="bottom" bottomOffset={BOTTOM_BAR_HEIGHT} config={toastConfig} />
                <UserDrawer />
                <Update />
              </NavigationContainer>
            </PersistQueryClientProvider> */}
              <Sandbox />
            </View>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </PaperProvider>
  );
}
