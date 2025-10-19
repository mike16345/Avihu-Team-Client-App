import useStyles from "@/styles/useGlobalStyles";
import Progression from "@/components/WeightProgression/Progression";
import WeightCardsContainer from "@/components/WeightGraph/WeightCardsContainer";
import useWeighInsQuery from "@/hooks/queries/WeighIns/useWeighInsQuery";
import { RefreshControl } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const WeightProgressionWindow = () => {
  const { spacing } = useStyles();
  const { isRefetching, refetch } = useWeighInsQuery();

  return (
    <KeyboardAwareScrollView
      bottomOffset={100}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        spacing.gap14,
        spacing.pdHorizontalLg,
        {
          paddingVertical: 12,
        },
      ]}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
    >
      <WeightCardsContainer />
      <Progression />
    </KeyboardAwareScrollView>
  );
};

export default WeightProgressionWindow;
