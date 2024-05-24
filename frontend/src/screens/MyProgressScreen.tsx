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
import { weighIns } from "../constants/MyWeight";
import Animated from "react-native-reanimated";
import { IWeighIn } from "../interfaces/User";
import DateUtils from "../utils/dateUtils";
import type { DateFormatType, DateRanges, ItemsInDateRangeParams } from "../types/dateTypes";

const screenWidth = Dimensions.get("window").width;

const MyProgressScreen = () => {
  const rangeParams: ItemsInDateRangeParams<IWeighIn> = {
    items: weighIns,
    dateKey: "date",
    n: 1,
    range: "weeks",
  };

  const [tooltipValue, setTooltipValue] = useState<number | null>(null);
  const [currentRange, setCurrentRange] = useState<DateRanges>("weeks");
  const [weights, setWeights] = useState<IWeighIn[]>(DateUtils.getItemsInRange(rangeParams));

  const handleRangeChange = (range: DateRanges) => {
    try {
      const weights = DateUtils.getItemsInRange({ ...rangeParams, range: range });
      console.log(weights.length);

      setWeights(weights);
      setCurrentRange(range);
    } catch (error) {
      console.error("Error during range change:", error);
    }
  };

  const extractWeights = (items: IWeighIn[]) => {
    return items.map((item) => item.weight);
  };

  const extractLabels = (items: IWeighIn[]) => {
    return DateUtils.extractLabels({ items, dateKey: "date", n: 1, range: currentRange });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Animated.View>
        <LineChart
          data={{
            labels: extractLabels(weights),
            datasets: [
              {
                data: extractWeights(weights),
                strokeWidth: 2,
              },
            ],
            legend: ["מעקב שקילה"],
          }}
          width={screenWidth}
          height={220}
          onDataPointClick={({ value }) => {
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
              stroke: "#fff",
            },
          }}
          bezier
          style={{
            marginVertical: 8,
          }}
        />
      </Animated.View>

      <View style={styles.buttonContainer}>
        <Button title="1W" onPress={() => handleRangeChange("weeks")} />
        <Button title="1M" onPress={() => handleRangeChange("months")} />
        <Button title="1Y" onPress={() => handleRangeChange("years")} />
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

export default MyProgressScreen;
