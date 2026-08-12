import { RefreshControl, ScrollView } from "react-native";
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
import type { AnyDietPlan } from "@/interfaces/DietPlanTypes";
import ErrorScreen from "@/screens/ErrorScreen";
import useStyles from "@/styles/useGlobalStyles";

const MyDietPlanScreen = () => {
  const { spacing, layout } = useStyles();
  const { data, error, isError, isFetching, isLoading, refetch } = useDietPlanQuery<AnyDietPlan>();
  const errorStatus = (error as { status?: number } | null)?.status;

  if (errorStatus === 404) {
    return (
      <PlanPendingState
        title="תפריט תזונה בבנייה"
        description="ברגע שהמאמן יסיים לבנות לך את התפריט הוא יופיע לך כאן."
        isFetching={isFetching}
        onRefresh={() => void refetch()}
      />
    );
  }

  if (isError) {
    return <ErrorScreen error={error} refetchFunc={() => void refetch()} isFetching={isFetching} />;
  }

  if (isLoading) return <DietPlanSkeleton />;

  const version = resolveDietPlanVersion(data);

  if (version === null || !data) {
    return (
      <ErrorScreen
        error={new Error("גרסת תפריט התזונה אינה נתמכת")}
        refetchFunc={() => void refetch()}
        isFetching={isFetching}
      />
    );
  }

  let v2Plan = null;

  if (version === 2) {
    if (!isDietPlanV2(data)) {
      return (
        <ErrorScreen
          error={new Error("גרסת תפריט התזונה אינה נתמכת")}
          refetchFunc={() => void refetch()}
          isFetching={isFetching}
        />
      );
    }

    v2Plan = data;
  }

  if (getDietPlanContentState(data) === "empty") {
    return (
      <PlanPendingState
        title="תפריט תזונה בבנייה"
        description="ברגע שהמאמן יסיים לבנות לך את התפריט הוא יופיע לך כאן."
        isFetching={isFetching}
        onRefresh={() => void refetch()}
      />
    );
  }

  return (
    <ScrollView
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
