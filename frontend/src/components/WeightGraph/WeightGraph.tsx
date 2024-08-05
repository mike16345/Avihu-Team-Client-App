import { View, StyleSheet, useWindowDimensions } from "react-native";
import { FC, useEffect, useState } from "react";
import { LineChart } from "react-native-chart-kit";
import { IWeighIn } from "@/interfaces/User";
import { ItemsInDateRangeParams, DateRanges } from "@/types/dateTypes";
import DateUtils from "@/utils/dateUtils";
import { Colors } from "@/constants/Colors";
import WeightCard from "./WeightCard";
import WeeklyScoreCard from "./WeeklyScoreCard";
import AddWeight from "./AddWeight";
import ChangeRangeBtns from "./ChangeRangeBtns";
import { useWeighInApi } from "@/hooks/useWeighInApi";
import { myWeighIns } from "@/constants/MyWeight";

const rangeParams: ItemsInDateRangeParams<IWeighIn> = {
  items: [],
  dateKey: "date",
  n: 1,
  range: "weeks",
};

interface WeightGraphProps {
  weighIns: IWeighIn[];
}

export const WeightGraph: FC<WeightGraphProps> = ({ weighIns }) => {
  const { width } = useWindowDimensions();
  const { addWeighIn } = useWeighInApi();

  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [currentRange, setCurrentRange] = useState<DateRanges>("weeks");
  const [userWeighIns, setUserWeighIns] = useState<IWeighIn[]>([]);
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
    const newWeighIns = DateUtils.getItemsInRange({
      ...rangeParams,
      items: weighIns,
      range: range,
    });
    const weights = extractWeights(userWeighIns);

    setWeights(weights);
    setUserWeighIns(newWeighIns);
    setCurrentRange(range);
  };

  const handleSaveNewWeighIn = (newWeighIn: IWeighIn) => {
    addWeighIn("665f0b0b00b1a04e8f1c4478", newWeighIn)
      .then((res) => {
        const updatedWeighIns = res.weighIns;
        const weights = extractWeights(updatedWeighIns);

        setUserWeighIns(updatedWeighIns);
        setWeights(weights);
      })
      .catch((err) => console.log("err", err));
  };

  function extractWeights(items: IWeighIn[]) {
    return items.map((item) => item.weight);
  }

  useEffect(() => {
    try {
      const weighInsInRange = DateUtils.getItemsInRange({ ...rangeParams, items: weighIns });
      console.log("test", weighInsInRange);

      setUserWeighIns(weighInsInRange);
      setWeights(extractWeights(weighInsInRange));
    } catch (err) {
      console.log("error fetching weigh ins: ", err);
    }
  }, [weighIns]);

  return (
    <View style={[styles.container, { width: width - 4 }]}>
      <View style={styles.weightContainer}>
        <LineChart
          data={{
            labels:
              DateUtils.extractLabels({
                ...rangeParams,
                items: weighIns,
                range: currentRange,
              }) || [],
            datasets: [
              {
                data: weights,
                strokeWidth: 2,
              },
            ],
            legend: ["מעקב שקילה"],
          }}
          hidePointsAtIndex={hidePointsAtIndex()}
          width={width - 15}
          height={220}
          onDataPointClick={({ value }) => {
            setSelectedWeight(value);
          }}
          chartConfig={{
            backgroundColor: Colors.bgSecondary,
            backgroundGradientFrom: Colors.bgSecondary,
            backgroundGradientTo: Colors.bgSecondary,

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
            borderRadius: 12,
            padding: 4,
          }}
        />
        <ChangeRangeBtns onRangeChange={handleRangeChange} />
        <View style={{ height: 120 }} className="flex-row items-center justify-between  gap-4">
          <WeightCard currentWeight={selectedWeight || weights[weights.length - 1]} />
          <WeeklyScoreCard weights={weights} range={currentRange} />
        </View>
      </View>
      <AddWeight onSave={handleSaveNewWeighIn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  weightContainer: {
    gap: 12,
  },
});
