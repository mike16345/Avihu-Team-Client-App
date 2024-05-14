import { StatusBar } from 'expo-status-bar';
import {  Text, View } from 'react-native';
import "./global.css";
import Navbar from './src/components/Navbar/Navbar';

export default function App() {
  return (
    <View className='flex-1 justify-center items-center bg-black '>
      <View className='absolute bottom-0'>
        <Navbar/>
      </View>
      <Text className='text-black text-xl '>It indeed works!</Text>
      <StatusBar style="auto" />
    </View>
  );
}


