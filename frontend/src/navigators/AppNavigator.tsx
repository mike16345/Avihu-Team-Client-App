import BottomTabNavigator from "./BottomTabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "@/screens/ProfileScreen";
import { RootStackParamList } from "@/types/navigatorTypes";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatScreen from "@/screens/ChatScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ animation: "slide_from_left" }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ presentation: "modal", header: () => <ChatHeader />, headerShown: true }}
      />
    </Stack.Navigator>
  );
}
