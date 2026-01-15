import BottomTabNavigator from "./BottomTabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "@/screens/ProfileScreen";
import { RootStackParamList } from "@/types/navigatorTypes";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatScreen from "@/screens/ChatScreen";
import FormPresetScreen from "@/screens/FormPresetScreen";
import useInitialFormGate from "@/hooks/useInitialFormGate";
import AgreementFlow from "./AgreementStack";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  /*   useInitialFormGate(); */

  return (
    <Stack.Navigator initialRouteName="agreements" screenOptions={{ headerShown: false }}>
      {/*   <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
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
      <Stack.Screen name="FormPreset" component={FormPresetScreen} /> */}
      <Stack.Screen name="agreements" component={AgreementFlow} />
    </Stack.Navigator>
  );
}
