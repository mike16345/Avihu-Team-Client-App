import "react-native-reanimated";
import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { defaultTheme as CustomDarkTheme, ThemeProvider } from "@/themes/useAppTheme";
import { Appearance, View } from "react-native";
import RootNavigator from "@/navigators/RootNavigator";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import UserDrawer from "@/components/User/UserDrawer";
import Update from "@/hooks/useUpdates";
import persister from "@/QueryClient/queryPersister";
import queryClient from "@/QueryClient/queryClient";
import { useOneTimeRTLFix } from "@/hooks/useEnsureRTL";
import ToastContainer from "@/components/ui/toast/ToastContainer";
import useCustomFonts from "@/hooks/useCustomFonts";

export default function App() {
  const ready = useOneTimeRTLFix();
  const colorScheme = Appearance.getColorScheme();
  const [loaded] = useCustomFonts();

  if (!loaded || !ready) return;

  return (
    <PaperProvider theme={CustomDarkTheme}>
      <ThemeProvider>
        <GestureHandlerRootView>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <View style={[{ direction: "rtl" }, { flex: 1 }]}>
              <PersistQueryClientProvider
                client={queryClient}
                persistOptions={{ persister: persister }}
              >
                <NavigationContainer>
                  <RootNavigator />
                  <StatusBar key={colorScheme} translucent style={"dark"} />
                  <ToastContainer />
                  <UserDrawer />
                  <Update />
                </NavigationContainer>
              </PersistQueryClientProvider>
            </View>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </PaperProvider>
  );
}
