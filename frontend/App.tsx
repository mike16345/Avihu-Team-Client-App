import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import "./global.css";
import LoginPage from './src/pages/LoginPage';

export default function App() {
  return (
    <View className='flex-1 justify-center items-center  '>
      <LoginPage />
      <StatusBar style="auto" />
    </View>
  );
}
