import BottomTabNavigator from "./BottomTabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "@/screens/ProfileScreen";
import { RootStackParamList } from "@/types/navigatorTypes";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatScreen from "@/screens/ChatScreen";
import FormPresetScreen from "@/screens/FormPresetScreen";
import AgreementFlow from "./AgreementStack";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({
  initialRoute = { route: "BottomTabs" },
}: {
  initialRoute: {
    route: keyof RootStackParamList;
    params?: RootStackParamList[keyof RootStackParamList];
  };
}) {
  return (
    <Stack.Navigator initialRouteName={initialRoute.route} screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="BottomTabs"
        component={BottomTabNavigator}
        initialParams={
          initialRoute.route === "BottomTabs" ? (initialRoute.params as any) : undefined
        }
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ animation: "slide_from_left" }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          presentation: "containedModal",
          header: () => <ChatHeader />,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="FormPreset"
        component={FormPresetScreen}
        options={{ headerBackVisible: false, gestureEnabled: false }}
        initialParams={
          initialRoute.route === "FormPreset" ? (initialRoute.params as any) : undefined
        }
      />
      <Stack.Screen
        name="agreements"
        component={AgreementFlow}
        options={{ headerBackVisible: false, gestureEnabled: false }}
        initialParams={
          initialRoute.route === "agreements" ? (initialRoute.params as any) : undefined
        }
      />
    </Stack.Navigator>
  );
}
