import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import "./global.css";
import LoginPage from './src/pages/LoginPage';
import MyDietPlanPage from "./src/pages/MyDietPlanPage";

export default function App() {
  return (
    <View className='flex-1 justify-center items-center  '>
      <MyDietPlanPage />
      <StatusBar style="auto" />
    </View>
  );
}
