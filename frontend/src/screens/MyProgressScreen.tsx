import React, { useState } from "react";
import { View, Button, Dimensions, StyleSheet, ScrollView, StatusBar } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { weighIns, weights } from "../constants/MyWeight";

const screenWidth = Dimensions.get("window").width;

const externalDataSet = {
  oneMonth: {
    labels: ["01/01", "01/08", "01/15", "01/22", "01/29"],
    data: [60, 58, 59, 55, 57],
  },
  threeMonths: {
    labels: ["Jan", "Feb", "Mar"],
    data: [60, 62, 61],
  },
  oneYear: {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    data: [65, 63, 64, 62],
  },
};

type Ranges = "oneMonth" | "threeMonths" | "oneYear";
const ChartWithDynamicColors = () => {
  const [currentRange, setCurrentRange] = useState<Ranges>("oneMonth");

  const chartData = externalDataSet[currentRange].data;
  const chartLabels = externalDataSet[currentRange].labels;

  const handleRangeChange = (range: Ranges) => {
    try {
      setCurrentRange(range);
    } catch (error) {
      console.error("Error during range change:", error);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <LineChart
        data={{
          labels: chartLabels,
          datasets: [
            {
              data: weights,
              strokeWidth: 2,
            },
          ],
          legend: ["מעקב שקילה"],
        }}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: "#18181b",
          backgroundGradientFrom: "#18181b",
          backgroundGradientTo: "#18181b",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // text-emerald-300
          labelColor: (opacity = 1) => `rgba(256, 256, 256, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            onPress: (e) => {},
            r: "6",
            strokeWidth: "2",
            stroke: "#fff", // White color for the dots
          },
        }}
        bezier
        style={{
          marginVertical: 8,
        }}
      />
      <View style={styles.buttonContainer}>
        <Button title="1M" onPress={() => handleRangeChange("oneMonth")} />
        <Button title="3M" onPress={() => handleRangeChange("threeMonths")} />
        <Button title="1Y" onPress={() => handleRangeChange("oneYear")} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "black",
    paddingTop: StatusBar.currentHeight,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
});

export default ChartWithDynamicColors;
