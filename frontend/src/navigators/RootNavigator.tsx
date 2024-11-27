import { useEffect, useState } from "react";
import Login from "@/components/Login/Login";
import { GetStartedScreen } from "@/screens/GetStartedScreen";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import BottomTabNavigator from "./BottomTabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUserApi } from "@/hooks/api/useUserApi";
import { useUserStore } from "@/store/userStore";
import { IUser } from "@/interfaces/User";
import Loader from "@/components/ui/loaders/Loader";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const sessionStorage = useAsyncStorage("sessionToken");

  const { checkUserSessionToken, getUserById } = useUserApi();
  const { currentUser, setCurrentUser } = useUserStore();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onLogin = (user: IUser) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const checkLoginStatus = async () => {
    const token = await sessionStorage.getItem();
    const tokenData = JSON.parse(token || "{}");
    if (!token || !tokenData) return;
    setIsLoading(true);

    try {
      const isValidSession = (await checkUserSessionToken(tokenData)).isValid;

      if (!isValidSession) {
        setIsLoggedIn(false);
        sessionStorage.removeItem();
        return;
      }
      const user = await getUserById(tokenData.userId);

      setCurrentUser(user);
      setIsLoggedIn(true);
      setIsLoading(false);
    } catch (error) {
      setIsLoggedIn(false);
      setIsLoading(false);
      sessionStorage.removeItem();
    }
  };

  useEffect(() => {
    checkLoginStatus();

    return () => {
      sessionStorage.removeItem();
    };
  }, []);

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn && currentUser && (
          <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
        )}
        {!isLoggedIn && (
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
