import { View, Text, Dimensions } from "react-native";
import React from "react";
import { LineChart } from "react-native-chart-kit";
import { weighIns, weights } from "../constants/MyWeight";
import { ScrollView } from "react-native-gesture-handler";

const MyProgressScreen = () => {
  return (
    <View className=" flex-1 bg-black h-screen pt-12 ">
      <LineChart
        data={{
          labels: ["February", "March", "April", "May", "June"],
          datasets: [
            {
              data: weights,
            },
          ],
        }}
        width={Dimensions.get("window").width} // from react-native
        height={350}
        yAxisSuffix="lb"
        yAxisInterval={1} // optional, defaults to 1
        chartConfig={{
          backgroundColor: "#1c1917",
          backgroundGradientFrom: "#1c1917",
          backgroundGradientTo: "#292524",
          propsForLabels: { fontStyle: "italic", onPress: () => console.log("something") },
          decimalPlaces: 1, // optional, defaults to 2dp
          color: (opacity = 1) => `#6ee7b7`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: "#FFF",
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

export default MyProgressScreen;
