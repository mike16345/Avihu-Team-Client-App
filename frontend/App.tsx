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
import { useUserApi } from "@/hooks/api/useUserApi";
import { adaptNavigationTheme, PaperProvider } from "react-native-paper";
import {
  LightTheme as CustomLightTheme,
  DarkTheme as CustomDarkTheme,
  ThemeProvider,
} from "@/themes/useAppTheme";
import { Appearance, StyleSheet, Text, View } from "react-native";
import RootNavigator from "@/navigators/RootNavigator";
import "react-native-gesture-handler";
import Loader from "@/components/ui/loaders/Loader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { BOTTOM_BAR_HEIGHT } from "@/constants/Constants";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";

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

  return (
    <PaperProvider
      theme={/* colorScheme == "dark" ? CustomDarkTheme : CustomLightTheme */ CustomDarkTheme}
    >
      <ThemeProvider>
        <GestureHandlerRootView>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <QueryClientProvider client={queryClient}>
              <NavigationContainer theme={DarkTheme}>
                <Text style={{ fontFamily: "Assistant", color: `red` }}>Inter Black</Text>
                <RootNavigator />
                <StatusBar key={colorScheme} translucent style={"light"} />
                <Toast position="bottom" bottomOffset={BOTTOM_BAR_HEIGHT} />
              </NavigationContainer>
            </QueryClientProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </PaperProvider>
  );
}
