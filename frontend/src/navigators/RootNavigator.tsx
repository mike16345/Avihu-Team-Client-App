import { useEffect, useState } from "react";
import Login from "@/components/Login/Login";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import BottomTabNavigator from "./BottomTabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUserApi } from "@/hooks/api/useUserApi";
import { useUserStore } from "@/store/userStore";
import { IUser } from "@/interfaces/User";
import Loader from "@/components/ui/loaders/Loader";
import useNotification from "@/hooks/useNotfication";
import { showAlert } from "@/utils/utils";
import { NO_ACCESS } from "@/constants/Constants";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const sessionStorage = useAsyncStorage("sessionToken");

  const { checkUserSessionToken, getUserById } = useUserApi();
  const { currentUser, setCurrentUser } = useUserStore();
  const { initializeNotifications, requestPermissions } = useNotification();

  const [isLoading, setIsLoading] = useState(false);

  const onLogin = (user: IUser) => {
    setCurrentUser(user);
  };

  const checkLoginStatus = async () => {
    const token = await sessionStorage.getItem();
    const tokenData = JSON.parse(token || "{}");
    if (!token || !tokenData) return;
    setIsLoading(true);

    try {
      const { isValid, hasAccess } = await checkUserSessionToken(tokenData);

      if (!hasAccess) {
        showAlert("error", NO_ACCESS);
        setIsLoading(false);
        return;
      }

      if (!isValid) {
        sessionStorage.removeItem();
        return;
      }
      const user = await getUserById(tokenData.userId);

      setCurrentUser(user);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      sessionStorage.removeItem();
    }
  };

  useEffect(() => {
    checkLoginStatus();
    requestPermissions()
      .then(() => {
        initializeNotifications();
      })
      .catch((err) => console.log(err));

    return () => {
      sessionStorage.removeItem();
    };
  }, []);

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
      {isLoading && <Loader variant="Screen" />}
    </>
  );
};

export default RootNavigator;
