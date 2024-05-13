import { StatusBar } from 'expo-status-bar';
import {  Text, View } from 'react-native';
import "./global.css";

export default function App() {
  return (
    <View className='flex-1 justify-center items-center bg-green-500 '>
      <Text className='text-black text-xl '>It indeed works!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

