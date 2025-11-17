import { useEffect, useLayoutEffect, useState } from "react";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useUserApi } from "@/hooks/api/useUserApi";
import { useUserStore } from "@/store/userStore";
import useNotification from "@/hooks/useNotification";
import { NO_ACCESS, SESSION_EXPIRED } from "@/constants/Constants";
import { SESSION_TOKEN_KEY } from "@/constants/reactQuery";
import useLogout from "@/hooks/useLogout";
import useUserQuery from "@/hooks/queries/useUserQuery";
import SplashScreen from "@/screens/SplashScreen";
import { useToast } from "@/hooks/useToast";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";

const RootNavigator = () => {
  const sessionStorage = useAsyncStorage(SESSION_TOKEN_KEY);
  const { triggerErrorToast } = useToast();

  const { currentUser, setCurrentUser } = useUserStore();
  const { data } = useUserQuery(currentUser?._id);
  const { checkUserSessionToken } = useUserApi();
  const { initializeNotifications, requestPermissions, notificationReceivedListener } =
    useNotification();
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

    requestPermissions().catch((err) => console.log(err));

    const notificationListener = notificationReceivedListener();

    return () => {
      notificationListener?.remove();
    };
  }, []);

  useEffect(() => {
    if (!data) return;
    setCurrentUser(data);
  }, [data]);

  if (loading) return <SplashScreen />;

  return currentUser ? <AppNavigator /> : <AuthNavigator />;
};

export default RootNavigator;
