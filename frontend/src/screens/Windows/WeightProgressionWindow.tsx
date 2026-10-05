import useStyles from "@/styles/useGlobalStyles";
import Progression from "@/components/WeightProgression/Progression";
import WeightCardsContainer from "@/components/WeightGraph/WeightCardsContainer";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import { RefreshControl } from "react-native";
import CustomScrollView from "@/components/ui/scrollview/CustomScrollView";
import { E2E_TEST_IDS } from "@/constants/e2e";

const WeightProgressionWindow = () => {
  const { spacing } = useStyles();
  const { isRefetching, refetch } = useWeighInsQuery();

  return (
    <CustomScrollView
      testID={E2E_TEST_IDS.homeWeightWindow}
      bottomOffset={100}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        spacing.gap14,
        spacing.pdHorizontalLg,
        {
          paddingTop: 12,
        },
      ]}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
    >
      <WeightCardsContainer />
      <Progression />
    </CustomScrollView>
  );
};

export default WeightProgressionWindow;
