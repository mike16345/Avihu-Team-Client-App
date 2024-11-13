import { useEffect, useState } from "react";
import Login from "@/components/Login/Login";
import { GetStartedScreen } from "@/screens/GetStartedScreen";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import BottomTabNavigator from "./BottomTabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUserApi } from "@/hooks/api/useUserApi";
import { useUserStore } from "@/store/userStore";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { getItem, removeItem } = useAsyncStorage("sessionToken");
  const { checkUserSessionToken, getUserById } = useUserApi();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLoginStatus = async () => {
    const token = await getItem();
    const tokenData = JSON.parse(token || "{}");
    if (!token || !tokenData) return;

    try {
      const isValidSession = (await checkUserSessionToken(tokenData)).isValid;

      if (!isValidSession) {
        setIsLoggedIn(false);
        removeItem();
        return;
      }
      const user = await getUserById(tokenData.userId);
      console.log("user", user);

      setCurrentUser(user);
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
      removeItem();
    }
  };

  useEffect(() => {
    removeItem();

    checkLoginStatus();

    return () => {
      removeItem();
    };
  }, []);

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn && <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />}
        {!isLoggedIn && (
          <>
            <Stack.Screen name="HomePage" component={GetStartedScreen} />
            <Stack.Screen
              children={() => <Login setIsLoggedIn={setIsLoggedIn} />}
              name="LoginScreen"
            />
          </>
        )}
      </Stack.Navigator>
    </>
  );
};

export default RootNavigator;
