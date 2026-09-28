import { RefreshControl, ScrollView, View } from "react-native";
import DietPlanV1View from "@/components/DietPlan/DietPlanV1View";
import DietPlanV2View from "@/components/DietPlanV2/DietPlanV2View";
import {
  getDietPlanContentState,
  isDietPlanV2,
  resolveDietPlanVersion,
} from "@/components/DietPlanV2/dietPlanV2Utils";
import PlanPendingState from "@/components/ui/PlanPendingState";
import DietPlanSkeleton from "@/components/ui/loaders/skeletons/DietPlanSkeleton";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
import ErrorScreen from "@/screens/ErrorScreen";
import useStyles from "@/styles/useGlobalStyles";
import { E2E_TEST_IDS } from "@/constants/e2e";

const MyDietPlanScreen = () => {
  const { spacing, layout } = useStyles();
  const { data, error, isError, isFetching, isLoading, refetch } = useDietPlanQuery();
  const errorStatus = (error as { status?: number } | null)?.status;

  if (errorStatus === 404) {
    return (
      <View testID={E2E_TEST_IDS.dietRoot} style={layout.flex1}>
        <PlanPendingState
          title="תפריט תזונה בבנייה"
          description="ברגע שהמאמן יסיים לבנות לך את התפריט הוא יופיע לך כאן."
          isFetching={isFetching}
          onRefresh={() => void refetch()}
        />
      </View>
    );
  }

  if (isError) {
    return (
      <View testID={E2E_TEST_IDS.dietRoot} style={layout.flex1}>
        <ErrorScreen error={error} refetchFunc={() => void refetch()} isFetching={isFetching} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View testID={E2E_TEST_IDS.dietRoot} style={layout.flex1}>
        <DietPlanSkeleton />
      </View>
    );
  }

  const version = resolveDietPlanVersion(data);

  if (version === null || !data) {
    return (
      <View testID={E2E_TEST_IDS.dietRoot} style={layout.flex1}>
        <ErrorScreen
          error={new Error("גרסת תפריט התזונה אינה נתמכת")}
          refetchFunc={() => void refetch()}
          isFetching={isFetching}
        />
      </View>
    );
  }

  let v2Plan = null;

  if (version === 2) {
    if (!isDietPlanV2(data)) {
      return (
        <View testID={E2E_TEST_IDS.dietRoot} style={layout.flex1}>
          <ErrorScreen
            error={new Error("גרסת תפריט התזונה אינה נתמכת")}
            refetchFunc={() => void refetch()}
            isFetching={isFetching}
          />
        </View>
      );
    }

    v2Plan = data;
  }

  if (getDietPlanContentState(data) === "empty") {
    return (
      <View testID={E2E_TEST_IDS.dietRoot} style={layout.flex1}>
        <PlanPendingState
          title="תפריט תזונה בבנייה"
          description="ברגע שהמאמן יסיים לבנות לך את התפריט הוא יופיע לך כאן."
          isFetching={isFetching}
          onRefresh={() => void refetch()}
        />
      </View>
    );
  }

  return (
    <ScrollView
      testID={E2E_TEST_IDS.dietRoot}
      style={[layout.flex1]}
      contentContainerStyle={[spacing.gap34, spacing.pdBottomBar, spacing.pdStatusBar]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => void refetch()} />}
    >
      {v2Plan ? <DietPlanV2View plan={v2Plan} /> : <DietPlanV1View />}
    </ScrollView>
  );
};

export default MyDietPlanScreen;
