import { Animated, ScrollView, View } from "react-native";
import { useMemo, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { useDropwDownContext } from "@/context/useDropdown";
import { ConditionalRender } from "../ui/ConditionalRender";
import { Text } from "../ui/Text";
import Collapsible from "../ui/Collapsible";
import Icon from "../Icon/Icon";
import Graph from "../ui/graph/Graph";
import { getDataAvgPerDate, getGrowthTrend, groupRecordedSetsByDate } from "@/utils/recordedSets";
import { useFadeIn } from "@/styles/useFadeIn";
import { IconName } from "@/constants/iconMap";

const ANIMATION_DURATION = 1200;

const GraphsContainer = () => {
  const { colors, fonts, layout, spacing } = useStyles();
  const { items, selectedValue } = useDropwDownContext();
  const opacity = useFadeIn(ANIMATION_DURATION);

  const [collapseRepsGraph, setCollapseRepsGraph] = useState(false);
  const [collapseWeightGraph, setCollapseWeightGraph] = useState(true);

  const handleCollapseChange = () => {
    setCollapseRepsGraph((prev) => !prev);
    setCollapseWeightGraph((prev) => !prev);
  };

  const { labels, reps, repsTrend, weights, weightsTrend } = useMemo(() => {
    const labels: string[] = [];
    const reps: number[] = [];
    const weights: number[] = [];
    let repsTrend = 0;
    let weightsTrend = 0;

    if (!selectedValue) return { labels, reps, weights, repsTrend, weightsTrend };

    const setsByDate = groupRecordedSetsByDate(selectedValue);
    const { dataLabels, repAverages, weightAverages } = getDataAvgPerDate(setsByDate);

    repsTrend = getGrowthTrend(repAverages[repAverages.length - 1], repAverages[0]);
    weightsTrend = getGrowthTrend(weightAverages[weightAverages.length - 1], weightAverages[0]);

    return {
      labels: dataLabels,
      reps: repAverages,
      weights: weightAverages,
      repsTrend,
      weightsTrend,
    };
  }, [selectedValue]);

  const recordedSetGraphs = [
    {
      label: "חזרות",
      icon: "clock",
      isTrendPositive: repsTrend > 0,
      trend: repsTrend,
      data: reps,
      collapseState: collapseRepsGraph,
    },
    {
      label: "משקל",
      icon: "upload",
      isTrendPositive: weightsTrend > 0,
      trend: weightsTrend,
      data: weights,
      collapseState: collapseWeightGraph,
    },
  ];

  return (
    <Animated.ScrollView
      style={{ opacity }}
      nestedScrollEnabled
      contentContainerStyle={spacing.gapDefault}
    >
      <ConditionalRender condition={items.length === 0}>
        <View style={[layout.center]}>
          <Text>לא הוקלטו סטים</Text>
        </View>
      </ConditionalRender>

      <ConditionalRender condition={items.length !== 0}>
        {recordedSetGraphs.map(({ data, label, icon, trend, isTrendPositive, collapseState }) => (
          <Collapsible
            key={label + data.length}
            isCollapsed={collapseState}
            onCollapseChange={handleCollapseChange}
            trigger={
              <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween]}>
                <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
                  <Icon name={icon as IconName} />
                  <Text style={fonts.lg}>{label}</Text>
                </View>

                <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
                  <Text style={fonts.lg}>{trend}%</Text>
                  <Icon
                    name="growthIndicator"
                    color={isTrendPositive ? colors.textSuccess.color : colors.textDanger.color}
                    rotation={isTrendPositive ? 0 : 90}
                  />
                </View>
              </View>
            }
          >
            <Graph data={data} labels={labels} />
          </Collapsible>
        ))}
      </ConditionalRender>
    </Animated.ScrollView>
  );
};

export default GraphsContainer;
