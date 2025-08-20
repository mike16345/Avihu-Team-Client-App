import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useMemo, useState } from "react";
import WeightCard from "@/components/WeightGraph/WeightCard";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import DateUtils from "@/utils/dateUtils";
import { ScrollView } from "react-native-gesture-handler";
import Progression from "@/components/WeightProgression/Progression";
import WeightInput from "@/components/WeightGraph/WeightInput";
import WeightCardsContainer from "@/components/WeightGraph/WeightCardsContainer";

const WeightProgressionWindow = () => {
  const { spacing } = useStyles();

  return (
    <ScrollView
      contentContainerStyle={[spacing.gapMd, { paddingHorizontal: 16, paddingVertical: 20 }]}
    >
      <WeightCardsContainer />
      <Progression />
      <WeightInput />
    </ScrollView>
  );
};

export default WeightProgressionWindow;
