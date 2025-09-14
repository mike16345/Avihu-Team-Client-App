import { Animated, View } from "react-native";
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
import { GraphData } from "@/hooks/graph/useVictoryNativeGraphWeighIns";
import { GRAPH_HEIGHT } from "@/constants/Constants";

const ANIMATION_DURATION = 1200;

const GraphsContainer = () => {
  const { colors, layout, spacing } = useStyles();
  const { items, selectedValue } = useDropwDownContext();
  const opacity = useFadeIn(ANIMATION_DURATION);

  const [collapseRepsGraph, setCollapseRepsGraph] = useState(false);
  const [collapseWeightGraph, setCollapseWeightGraph] = useState(true);

  const handleCollapseChange = () => {
    setCollapseRepsGraph((prev) => !prev);
    setCollapseWeightGraph((prev) => !prev);
  };

  const { reps, repsTrend, weights, weightsTrend } = useMemo(() => {
    const labels: string[] = [];
    const reps: GraphData[] = [];
    const weights: GraphData[] = [];
    let repsTrend = 0;
    let weightsTrend = 0;

    if (!selectedValue) return { labels, reps, weights, repsTrend, weightsTrend };

    const setsByDate = groupRecordedSetsByDate(selectedValue);
    const { repAverages, weightAverages } = getDataAvgPerDate(setsByDate);

    repsTrend = getGrowthTrend(repAverages[repAverages.length - 1].value, repAverages[0].value);
    weightsTrend = getGrowthTrend(
      weightAverages[weightAverages.length - 1].value,
      weightAverages[0].value
    );

    return {
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
    <Animated.View style={[{ flex: 1, opacity: opacity }, spacing.gapDefault]}>
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
            style={[layout.flex1]}
            customHeight={GRAPH_HEIGHT}
            onCollapseChange={handleCollapseChange}
            keepMounted
            trigger={
              <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween]}>
                <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
                  <Icon name={icon as IconName} />
                  <Text fontSize={16}>{label}</Text>
                </View>

                <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
                  <Text fontSize={16}>{trend}%</Text>
                  <Icon
                    width={18}
                    height={18}
                    name="growthIndicator"
                    color={isTrendPositive ? colors.textSuccess.color : colors.textDanger.color}
                    rotation={isTrendPositive ? 0 : 90}
                  />
                </View>
              </View>
            }
          >
            <Graph data={data} />
          </Collapsible>
        ))}
      </ConditionalRender>
    </Animated.View>
  );
};

export default GraphsContainer;
