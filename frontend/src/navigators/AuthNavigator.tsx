import Login from "@/components/Login/Login";
import { useUserStore } from "@/store/userStore";
import { IUser } from "@/interfaces/User";
import { useQueryClient } from "@tanstack/react-query";
import SuccessScreen from "@/screens/SuccessScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "@/types/navigatorTypes";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const queryClient = useQueryClient();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const onLogin = (user: IUser) => {
    queryClient.setQueryData(["user-", user._id], user);
    setCurrentUser(user);
  };

  return (
    <Stack.Navigator screenOptions={{ animation: "slide_from_right", headerShown: false }}>
      <Stack.Screen
        options={{ animation: "slide_from_left" }}
        children={() => <Login onLogin={onLogin} />}
        name="LoginScreen"
      />
      <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
    </Stack.Navigator>
  );
}
