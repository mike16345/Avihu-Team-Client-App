import { RefreshControl, ScrollView } from "react-native";
import DietPlanContentTabs from "@/components/DietPlan/DietPlanContentTabs";
import DietPlanScreenHeader from "@/components/DietPlan/DietPlanScreenHeader";
import PlanPendingState from "@/components/ui/PlanPendingState";
import DietPlanSkeleton from "@/components/ui/loaders/skeletons/DietPlanSkeleton";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
import { useDailyDietReset } from "@/hooks/useDailyDietReset";
import ErrorScreen from "@/screens/ErrorScreen";
import useStyles from "@/styles/useGlobalStyles";
import { isHtmlEmpty } from "@/utils/utils";

const MyDietPlanScreen = () => {
  const { spacing, layout } = useStyles();
  const { data, error, isError, isFetching, isLoading, refetch } = useDietPlanQuery();
  useDailyDietReset();

  const hasMeals = (data?.meals?.length ?? 0) > 0;
  const hasSupplements = !isHtmlEmpty(data?.supplements?.join("") || "");
  const hasInstructions = !isHtmlEmpty(data?.customInstructions?.join("") || "");
  const hasDietPlanContent = hasMeals || hasSupplements || hasInstructions;

  if (error?.status === 404 || (!isLoading && !isError && !hasDietPlanContent)) {
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

  return (
    <ScrollView
      style={[layout.flex1]}
      contentContainerStyle={[spacing.gap34, spacing.pdBottomBar, spacing.pdStatusBar]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={() => void refetch()} />
      }
    >
      <DietPlanScreenHeader />
      <DietPlanContentTabs />
    </ScrollView>
  );
};

export default MyDietPlanScreen;
