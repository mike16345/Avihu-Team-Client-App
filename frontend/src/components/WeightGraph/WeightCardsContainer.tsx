import { View } from "react-native";
import { useMemo } from "react";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import useStyles from "@/styles/useGlobalStyles";
import DateUtils from "@/utils/dateUtils";
import WeightCard from "./WeightCard";

const WeightCardsContainer = () => {
  const { data } = useWeighInsQuery();
  const { layout } = useStyles();

  const { latestWeighIn, monthlyWeighInProgress } = useMemo(() => {
    if (!data) return { latestWeighIn: 0, monthlyWeighInProgress: 0 };

    return {
      latestWeighIn: DateUtils.getLatestItem(data, "date")?.weight || 0,
      monthlyWeighInProgress: DateUtils.getProgressInLastXDays(data, "date", "weight", 30),
    };
  }, [data]);

  return (
    <View style={[layout.flexRow, layout.justifyBetween, layout.itemsCenter]}>
      <WeightCard
        title="מגמה חודשית"
        unit='ק"ג'
        value={monthlyWeighInProgress.toFixed(2)}
        operator={monthlyWeighInProgress > 0 ? "+" : undefined}
      />
      <WeightCard title="משקל נוכחי" unit='ק"ג' value={latestWeighIn.toFixed(2)} />
    </View>
  );
};

export default WeightCardsContainer;
