import { View } from "react-native";
import { useMemo } from "react";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import useStyles from "@/styles/useGlobalStyles";
import DateUtils from "@/utils/dateUtils";
import WeightCard from "./WeightCard";

const WeightCardsContainer = () => {
  const { data } = useWeighInsQuery();
  const { layout } = useStyles();

  const { latestWeighIn, monthlyWeighInAverage } = useMemo(() => {
    if (!data) return { latestWeighIn: 0, monthlyWeighInAverage: 0 };

    return {
      latestWeighIn: DateUtils.getLatestItem(data, "date")?.weight || 0,
      monthlyWeighInAverage: DateUtils.getAverageInLastXDays(data, "date", "weight", 30),
    };
  }, [data]);

  return (
    <View style={[layout.flexRow, layout.justifyBetween, layout.itemsCenter]}>
      <WeightCard
        title="מגמה חודשית"
        unit='ק"ג'
        value={monthlyWeighInAverage.toFixed(2)}
        operator="+"
      />
      <WeightCard title="משקל נוכחי" unit='ק"ג' value={latestWeighIn.toFixed(2)} />
    </View>
  );
};

export default WeightCardsContainer;
