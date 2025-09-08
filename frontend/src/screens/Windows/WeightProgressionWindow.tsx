import useStyles from "@/styles/useGlobalStyles";
import Progression from "@/components/WeightProgression/Progression";
import WeightCardsContainer from "@/components/WeightGraph/WeightCardsContainer";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import { RefreshControl, ScrollView } from "react-native";

const WeightProgressionWindow = () => {
  const { spacing } = useStyles();
  const { isRefetching, refetch } = useWeighInsQuery();

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        spacing.gapMd,
        {
          paddingVertical: 12,
          paddingHorizontal: 20,
        },
      ]}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
    >
      <WeightCardsContainer />
      <Progression />
    </ScrollView>
  );
};

export default WeightProgressionWindow;
