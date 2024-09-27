import { View, useWindowDimensions } from "react-native";
import { FC, useEffect, useState } from "react";
import { LineChart } from "react-native-chart-kit";
import { IWeighIn } from "@/interfaces/User";
import { ItemsInDateRangeParams, DateRanges } from "@/types/dateTypes";
import DateUtils from "@/utils/dateUtils";
import WeeklyScoreCard from "./WeeklyScoreCard";
import ChangeRangeBtns from "./ChangeRangeBtns";
import useGraphTheme from "@/themes/useGraphTheme";
import useStyles from "@/styles/useGlobalStyles";
import CurrentWeightCard from "./CurrentWeightCard";

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
  const { layout, colors, spacing } = useStyles();
  const { width, height } = useWindowDimensions();

  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [currentRange, setCurrentRange] = useState<DateRanges>("weeks");
  const [weights, setWeights] = useState<number[]>([]);

  const graphTheme = useGraphTheme(weights);

  const currentWeight = selectedWeight || DateUtils.getLatestItem(weighIns, "date")?.weight;

  const hidePointsAtIndex = () => {
    if (weights.length < 100) return;

    const indices = weights
      .map((_, index) => {
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
    const weights = extractWeights(newWeighIns);

    setWeights(weights);
    setCurrentRange(range);
  };

  function extractWeights(items: IWeighIn[]) {
    return items.map((item) => item.weight);
  }

  useEffect(() => {
    const weighInsInRange = DateUtils.getItemsInRange({ ...rangeParams, items: weighIns });
    const weights = extractWeights(weighInsInRange);
    setWeights(weights);
  }, [weighIns]);

  return (
    <>
      <View style={[layout.container, layout.sizeFull, layout.center, { width: width - 4 }]}>
        <View style={spacing.gapMd}>
          <LineChart
            data={{
              labels: DateUtils.extractLabels({
                ...rangeParams,
                items: weighIns,
                range: currentRange,
              }),
              datasets: [
                {
                  data: weights.length > 0 ? weights : [0],
                  strokeWidth: 2,
                  color: (_: number) => colors.textPrimary.color,
                },
              ],
              legend: ["מעקב שקילה"],
            }}
            hidePointsAtIndex={hidePointsAtIndex()}
            width={width - 20}
            height={220}
            onDataPointClick={({ value }) => {
              setSelectedWeight(value);
            }}
            chartConfig={graphTheme}
            withInnerLines={false}
            withOuterLines={false}
            style={{
              borderRadius: 12,
              padding: 4,
            }}
          />
          <ChangeRangeBtns onRangeChange={handleRangeChange} />
          <View
            style={[
              spacing.gapLg,
              layout.flexRow,
              spacing.pdHorizontalSm,
              { minHeight: 100, flexShrink: 0 },
            ]}
          >
            <CurrentWeightCard currentWeight={currentWeight || 0} />
            <WeeklyScoreCard weights={weights} range={currentRange} />
          </View>
        </View>
      </View>
    </>
  );
};
