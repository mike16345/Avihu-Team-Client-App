import { useEffect, useLayoutEffect, useState } from "react";
import Login from "@/components/Login/Login";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import BottomTabNavigator from "./BottomTabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUserApi } from "@/hooks/api/useUserApi";
import { useUserStore } from "@/store/userStore";
import { IUser } from "@/interfaces/User";
import useNotification from "@/hooks/useNotfication";
import { NO_ACCESS, SESSION_EXPIRED } from "@/constants/Constants";
import { useQueryClient } from "@tanstack/react-query";
import { SESSION_TOKEN_KEY } from "@/constants/reactQuery";
import useLogout from "@/hooks/useLogout";
import useUserQuery from "@/hooks/queries/useUserQuery";
import SplashScreen from "@/screens/SplashScreen";
import SuccessScreen from "@/screens/SuccessScreen";
import { RootStackParamList } from "@/types/navigatorTypes";
import { useToast } from "@/hooks/useToast";
import ProfileScreen from "@/screens/ProfileScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const sessionStorage = useAsyncStorage(SESSION_TOKEN_KEY);
  const { triggerErrorToast } = useToast();

  const { currentUser, setCurrentUser } = useUserStore();
  const { data } = useUserQuery(currentUser?._id);
  const { checkUserSessionToken } = useUserApi();
  const { initializeNotifications, requestPermissions } = useNotification();
  const { handleLogout } = useLogout();

  const [loading, setLoading] = useState(true);

  const getUserFromLocalStorage = async () => {
    const token = await sessionStorage.getItem();
    const tokenData = JSON.parse(token || "{}");

    if (!token || !tokenData) return;
    const user = tokenData.data.user;
    setCurrentUser(user);
  };

  const checkLoginStatus = async () => {
    const token = await sessionStorage.getItem();
    const tokenData = JSON.parse(token || "{}");

    if (!token || !tokenData) return;

    try {
      const { isValid, hasAccess } = await checkUserSessionToken(tokenData);

      if (!hasAccess) {
        triggerErrorToast({ message: NO_ACCESS });

        return handleLogout();
      }

      if (!isValid) {
        triggerErrorToast({ message: SESSION_EXPIRED });

        return handleLogout();
      }
    } catch (error) {
      return;
    }
  };

  useLayoutEffect(() => {
    getUserFromLocalStorage();
  }, []);

  useEffect(() => {
    checkLoginStatus().then(() => setLoading(false));

    requestPermissions()
      .then(() => {
        initializeNotifications();
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (!data) return;
    setCurrentUser(data);
  }, [data]);

  if (loading) return <SplashScreen />;

  return currentUser ? <AppStack /> : <AuthStack />;
};

function AuthStack() {
  const queryClient = useQueryClient();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const onLogin = (user: IUser) => {
    queryClient.setQueryData(["user-", user._id], user);
    setCurrentUser(user);
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        options={{ animation: "slide_from_left" }}
        children={() => <Login onLogin={onLogin} />}
        name="LoginScreen"
      />
      <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ animation: "slide_from_left" }}
      />
    </Stack.Navigator>
  );
}

export default RootNavigator;
