import { View, Text, StyleSheet, StatusBar, useWindowDimensions, Platform } from "react-native";
import React, { useState } from "react";
import { LineChart } from "react-native-chart-kit";
import { myWeighIns } from "../../constants/MyWeight";
import { IWeighIn } from "../../interfaces/User";
import { ItemsInDateRangeParams, DateRanges } from "../../types/dateTypes";
import DateUtils from "../../utils/dateUtils";
import { Colors } from "../../constants/Colors";
import Button from "../Button/Button";
import WeightCard from "./WeightCard";
import WeeklyScoreCard from "./WeeklyScoreCard";

const rangeParams: ItemsInDateRangeParams<IWeighIn> = {
  items: myWeighIns,
  dateKey: "date",
  n: 1,
  range: "weeks",
};

export const WeightGraph = () => {
  const { width } = useWindowDimensions();

  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [currentRange, setCurrentRange] = useState<DateRanges>("weeks");
  const [weighIns, setWeighIns] = useState<IWeighIn[]>(DateUtils.getItemsInRange(rangeParams));
  const [weights, setWeights] = useState(extractWeights(weighIns));

  const hidePointsAtIndex = () => {
    if (weights.length < 100) return;

    const indices = weights
      .map((w, index) => {
        if (index % 2 !== 0) {
          return index;
        }
      })
      .filter((item) => item);

    return indices as number[];
  };

  const handleRangeChange = (range: DateRanges) => {
    const weighIns = DateUtils.getItemsInRange({ ...rangeParams, range: range });
    const weights = extractWeights(weighIns);

    setWeights(weights);
    setWeighIns(weighIns);
    setCurrentRange(range);
  };

  function extractWeights(items: IWeighIn[]) {
    return items.map((item) => item.weight);
  }

  return (
    <View style={styles.container}>
      <View>
        <LineChart
          data={{
            labels: DateUtils.extractLabels({
              ...rangeParams,
              items: weighIns,
              range: currentRange,
            }),

            datasets: [
              {
                data: weights,
                strokeWidth: 2,
              },
            ],
            legend: ["מעקב שקילה"],
          }}
          hidePointsAtIndex={hidePointsAtIndex()}
          width={width}
          height={220}
          onDataPointClick={({ value }) => {
            setSelectedWeight(value);
          }}
          chartConfig={{
            backgroundColor: Colors.bgSecondry,
            backgroundGradientFrom: Colors.bgSecondry,
            backgroundGradientTo: Colors.bgSecondry,

            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(256, 256, 256, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForLabels: {
              fontSize: 12,
              fontWeight: "bold",
              fontFamily: "sans-serif-light",
            },

            propsForDots: {
              r: weights.length > 35 ? "2" : "4",
              strokeWidth: weights.length > 35 ? "0.5" : "1",
              stroke: "#fff",
            },
          }}
          withInnerLines={false}
          withOuterLines={false}
          style={{
            borderRadius: 16,
          }}
        />
        <View style={styles.buttonContainer}>
          <Button style={styles.rangeButton} onPress={() => handleRangeChange("weeks")}>
            <Text style={styles.rangeText}>1W</Text>
          </Button>
          <Button style={styles.rangeButton} onPress={() => handleRangeChange("months")}>
            <Text style={styles.rangeText}>1M</Text>
          </Button>
          <Button style={styles.rangeButton} onPress={() => handleRangeChange("years")}>
            <Text style={styles.rangeText}>1Y</Text>
          </Button>
        </View>
      </View>

      <View
        style={{ height: 120 }}
        className="flex-row items-center justify-between w-screen gap-4"
      >
        <WeightCard currentWeight={selectedWeight || weights[weights.length - 1]} />
        <WeeklyScoreCard weights={weights} range={currentRange} />
      </View>
      <View style={{ flex: 1 }}>
        <Button style={styles.addWeightButton}>
          <Text>הוסף משקל</Text>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "black",
    gap: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  selectedWeight: {
    fontWeight: 600,
    textAlign: "center",
  },
  rangeButton: {
    backgroundColor: Colors.bgSecondry,
    borderRadius: 4,
    width: 100,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rangeText: {
    fontWeight: "600",
    color: Colors.primary,
  },
  addWeightButton: {
    width: "100%",
    height: 50,
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
});
