import { useEffect, useLayoutEffect, useState } from "react";
import Login from "@/components/Login/Login";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import BottomTabNavigator from "./BottomTabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUserApi } from "@/hooks/api/useUserApi";
import { useUserStore } from "@/store/userStore";
import { IUser } from "@/interfaces/User";
import useNotification from "@/hooks/useNotfication";
import { showAlert } from "@/utils/utils";
import { NO_ACCESS, SESSION_EXPIRED } from "@/constants/Constants";
import { useQueryClient } from "@tanstack/react-query";
import { SESSION_TOKEN_KEY } from "@/constants/reactQuery";
import useLogout from "@/hooks/useLogout";
import useUserQuery from "@/hooks/queries/useUserQuery";
import SplashScreen from "@/screens/SplashScreen";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const queryClient = useQueryClient();
  const sessionStorage = useAsyncStorage(SESSION_TOKEN_KEY);

  const { currentUser, setCurrentUser } = useUserStore();
  const { data } = useUserQuery(currentUser?._id);
  const { checkUserSessionToken } = useUserApi();
  const { initializeNotifications, requestPermissions } = useNotification();
  const { handleLogout } = useLogout();

  const [loading, setLoading] = useState(true);

  const onLogin = (user: IUser) => {
    queryClient.setQueryData(["user-", user._id], user);
    setCurrentUser(user);
  };

  const getUserFromLocalStorage = async () => {
    const token = await sessionStorage.getItem();
    const tokenData = JSON.parse(token || "{}");

    if (!token || !tokenData) return;
    const user = tokenData.data.user;
    setCurrentUser(user);
    setLoading(false);
  };

  const checkLoginStatus = async () => {
    const token = await sessionStorage.getItem();
    const tokenData = JSON.parse(token || "{}");

    if (!token || !tokenData) return;

    try {
      const { isValid, hasAccess } = await checkUserSessionToken(tokenData);

      if (!hasAccess) {
        showAlert("error", NO_ACCESS);
        handleLogout();
        return;
      }

      if (!isValid) {
        showAlert("error", SESSION_EXPIRED);
        handleLogout();
        return;
      }
    } catch (error) {
      return;
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    getUserFromLocalStorage();
  }, []);

  useEffect(() => {
    checkLoginStatus();
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

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser ? (
          <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
        ) : (
          <>
            <Stack.Screen children={() => <Login onLogin={onLogin} />} name="LoginScreen" />
          </>
        )}
      </Stack.Navigator>
    </>
  );
};

export default RootNavigator;
