import { View } from "react-native";
import { useMemo } from "react";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import useStyles from "@/styles/useGlobalStyles";
import DateUtils from "@/utils/dateUtils";
import WeightCard from "./WeightCard";

const WeightCardsContainer = () => {
  const { data } = useWeighInsQuery();
  const { layout, spacing } = useStyles();

  const latestWeighIn = useMemo(() => {
    if (!data) return 0;

    return DateUtils.getLatestItem(data, "date")?.weight || 0;
  }, [data]);

  return (
    <View style={[layout.flexRow, spacing.gap20]}>
      <WeightCard title="מגמה חודשית" unit='ק"ג' value={23.19} />
      <WeightCard title="מגמה חודשית" unit='ק"ג' value={latestWeighIn} />
    </View>
  );
};

export default WeightCardsContainer;
