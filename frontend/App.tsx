import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import "./global.css";

export default function App() {
  return (
    <View className="flex-1 justify-center items-center bg-red-500 ">
      <Text className="text-black text-xl ">It doesnt works!</Text>
      <Text className="text-black text-xl ">It doesnt works!</Text>

      <StatusBar style="auto" />
      <Text>Fuck your login page. We accepting this shit.</Text>
    </View>
  );
}
