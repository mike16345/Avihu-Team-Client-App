import "react-native-reanimated";
import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/themes/useAppTheme";
import { Appearance, View } from "react-native";
import RootNavigator from "@/navigators/RootNavigator";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import Update from "@/hooks/useUpdates";
import persister from "@/QueryClient/queryPersister";
import queryClient from "@/QueryClient/queryClient";
import { useOneTimeRTLFix } from "@/hooks/useEnsureRTL";
import ToastContainer from "@/components/ui/toast/ToastContainer";
import useCustomFonts from "@/hooks/useCustomFonts";
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";
import useBackgroundTasks from "@/hooks/useBackgroundTasks";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function App() {
  const ready = useOneTimeRTLFix();
  const colorScheme = Appearance.getColorScheme();
  const [loaded] = useCustomFonts();
  const { registerBackgroundTask, runTaskOnAppOpen } = useBackgroundTasks();

  useEffect(() => {
    registerBackgroundTask();
    runTaskOnAppOpen();
  }, []);

  if (!loaded || !ready) return;

  return (
    <KeyboardProvider preserveEdgeToEdge>
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
                  <Update />
                </NavigationContainer>
              </PersistQueryClientProvider>
            </View>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </KeyboardProvider>
  );
}
