import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useMemo, useState } from "react";
import WeightCard from "@/components/WeightGraph/WeightCard";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import DateUtils from "@/utils/dateUtils";
import { ScrollView } from "react-native-gesture-handler";
import Progression from "@/components/WeightProgression/Progression";
import WeightInput from "@/components/WeightGraph/WeightInput";

const WeightProgressionWindow = () => {
  const { data } = useWeighInsQuery();

  const { layout, spacing } = useStyles();

  const latestWeighIn = useMemo(() => {
    if (!data) return 0;
    const weighIn = DateUtils.getLatestItem(data, "date");

    return weighIn?.weight || 0;
  }, [data]);

  return (
    <ScrollView
      contentContainerStyle={[spacing.gapMd, { paddingHorizontal: 16, paddingVertical: 20 }]}
    >
      <View style={[layout.flexRow, spacing.gap20]}>
        <WeightCard title="מגמה חודשית" unit='ק"ג' value={23.19} />
        <WeightCard title="מגמה חודשית" unit='ק"ג' value={latestWeighIn} />
      </View>
      <Progression />
      <WeightInput />
    </ScrollView>
  );
};

export default WeightProgressionWindow;
