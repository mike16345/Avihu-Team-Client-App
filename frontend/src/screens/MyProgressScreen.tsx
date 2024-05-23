import React, { useState } from "react";
import {
  View,
  Button,
  Dimensions,
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
  Platform,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { weighIns, weights } from "../constants/MyWeight";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

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
  const tooltipX = useSharedValue(0);
  const tooltipY = useSharedValue(0);
  const tooltipStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tooltipX.value }, { translateY: tooltipY.value }],
  }));

  console.log("Statuse bar height: ", StatusBar.currentHeight);

  const [tooltipValue, setTooltipValue] = useState<number | null>(null);
  const [currentRange, setCurrentRange] = useState<Ranges>("oneMonth");

  const chartLabels = externalDataSet[currentRange].labels;

  const tapGesture = Gesture.Tap().onEnd((e) => {
    tooltipX.value = e.absoluteX;
    tooltipY.value = e.absoluteY;
  });

  const handleRangeChange = (range: Ranges) => {
    try {
      setCurrentRange(range);
    } catch (error) {
      console.error("Error during range change:", error);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <GestureDetector gesture={tapGesture}>
        <Animated.View>
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
            onDataPointClick={(data) => {
              const { x, y, value, getColor } = data;
              console.log("x", x);
              console.log("y", y);
              console.log("value", value);
              // tooltipX.value = x;
              // tooltipY.value = y;

              setTooltipValue(value);
            }}
            chartConfig={{
              backgroundColor: "#18181b",
              backgroundGradientFrom: "#18181b",
              backgroundGradientTo: "#18181b",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(256, 256, 256, ${opacity})`,
              style: {
                borderRadius: 16,
              },

              propsForDots: {
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
        </Animated.View>
      </GestureDetector>
      {tooltipValue !== null && (
        <Animated.View style={[styles.tooltip, tooltipStyle]}>
          <Text className="text-white  font-semibold">{tooltipValue}</Text>
        </Animated.View>
      )}
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
    paddingTop: StatusBar.currentHeight || 0,
    ...Platform.select({
      ios: {
        paddingTop: 32,
      },
      android: {
        // backgroundColor: "blue",
      },
    }),
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 4,
    zIndex: 100,
  },
});

export default ChartWithDynamicColors;
