import { useEffect, useState } from "react";
import Login from "@/components/Login/Login";
import { GetStartedScreen } from "@/screens/GetStartedScreen";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import BottomTabNavigator from "./BottomTabNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InputEmail from "@/components/Login/InputEmail";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { getItem, removeItem } = useAsyncStorage("isLoggedIn");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLoginStatus = async () => {
    const token = await getItem();
    if (token) setIsLoggedIn(true);
  };

  useEffect(() => {
    checkLoginStatus();

    return () => {
      removeItem();
    };
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
      ) : (
        <>
          <Stack.Screen name="HomePage" component={GetStartedScreen} />
          <Stack.Screen
            children={() => <Login setIsLoggedIn={setIsLoggedIn} />}
            name="LoginScreen"
          />
          <Stack.Screen children={() => <InputEmail />} name="EmailScreen" />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
