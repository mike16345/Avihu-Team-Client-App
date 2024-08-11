import { View, StyleSheet, useWindowDimensions, ScrollView } from "react-native";
import { FC, useEffect, useState } from "react";
import { LineChart } from "react-native-chart-kit";
import { IWeighIn, IWeighInPost } from "@/interfaces/User";
import { ItemsInDateRangeParams, DateRanges } from "@/types/dateTypes";
import DateUtils from "@/utils/dateUtils";
import WeeklyScoreCard from "./WeeklyScoreCard";
import ChangeRangeBtns from "./ChangeRangeBtns";
import { useWeighInApi } from "@/hooks/useWeighInApi";
import { useUserStore } from "@/store/userStore";
import useGraphTheme from "@/themes/useGraphTheme";
import WeightInputModal from "./WeightInputModal";
import OpacityButton from "../Button/OpacityButton";
import { Text } from "react-native-paper";
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
  const { text, layout, fonts, colors, common, spacing } = useStyles();

  const { width } = useWindowDimensions();
  const { addWeighIn } = useWeighInApi();

  const currentUser = useUserStore((state) => state.currentUser);

  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [currentRange, setCurrentRange] = useState<DateRanges>("weeks");
  const [weights, setWeights] = useState<number[]>([]);
  const [openWeightModal, setOpenWeightModal] = useState(false);

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

  const handleSaveNewWeighIn = (newWeighIn: number) => {
    setOpenWeightModal(false);
    if (!currentUser) return;
    const weighInPost: IWeighInPost = {
      weight: newWeighIn,
    };

    addWeighIn(currentUser._id, weighInPost)
      .then((res) => {
        const updatedWeighIns = res.weighIns;
        const newWeighIns = DateUtils.getItemsInRange({ ...rangeParams, items: updatedWeighIns });
        const weights = extractWeights(newWeighIns);

        setWeights(weights);
      })
      .catch((err) => console.log("err", err));
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
      <ScrollView
        contentContainerStyle={[
          layout.container,
          layout.sizeFull,
          layout.center,
          spacing.gapLg,
          { width: width - 4 },
        ]}
      >
        <View style={spacing.gapLg}>
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
                  color: (o: number) => colors.textPrimary.color,
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
            style={[spacing.gapLg, layout.flexRow, spacing.pdSm, { minHeight: 100, flexShrink: 0 }]}
          >
            <CurrentWeightCard currentWeight={currentWeight || 0} />
            <WeeklyScoreCard weights={weights} range={currentRange} />
          </View>
        </View>
        <View style={layout.widthFull}>
          <OpacityButton
            onPress={() => {
              setOpenWeightModal((open) => !open);
            }}
            style={[
              spacing.pdDefault,
              colors.backgroundPrimary,
              layout.center,
              common.roundedSm,
              styles.addWeightBtn,
            ]}
          >
            <Text style={[text.textBold, colors.textOnPrimary, fonts.lg]}>הוסף משקל</Text>
          </OpacityButton>
        </View>
      </ScrollView>

      {openWeightModal && (
        <WeightInputModal
          handleDismiss={() => setOpenWeightModal(false)}
          currentWeight={currentWeight || 0}
          handleSaveWeight={(weight) => handleSaveNewWeighIn(weight)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  weightContainer: {
    gap: 12,
  },
  addWeightBtn: {
    height: 50,
  },
});
