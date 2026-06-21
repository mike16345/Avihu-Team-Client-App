import DietPlanContentTabs from "@/components/DietPlan/DietPlanContentTabs";
import DietPlanScreenHeader from "@/components/DietPlan/DietPlanScreenHeader";
import PlanPendingState from "@/components/ui/PlanPendingState";
import DietPlanSkeleton from "@/components/ui/loaders/skeletons/DietPlanSkeleton";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
import ErrorScreen from "@/screens/ErrorScreen";
import useStyles from "@/styles/useGlobalStyles";
import { isHtmlEmpty } from "@/utils/utils";
import { View } from "react-native";

const MyDietPlanScreen = () => {
  const { spacing, layout } = useStyles();
  const { data, error, isError, isFetching, isLoading, refetch } = useDietPlanQuery();

  const hasMeals = (data?.meals?.length ?? 0) > 0;
  const hasSupplements = !isHtmlEmpty(data?.supplements?.join("") || "");
  const hasInstructions = !isHtmlEmpty(data?.customInstructions?.join("") || "");
  const hasDietPlanContent = hasMeals || hasSupplements || hasInstructions;

  if (error?.status === 404 || (!isLoading && !isError && !hasDietPlanContent)) {
    return (
      <PlanPendingState
        title="תוכנית התזונה שלך עדיין בהכנה"
        description="אנחנו משלימים עבורך את התוכנית. אפשר לרענן בעוד רגע ולבדוק אם היא כבר מוכנה."
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
    <View style={[spacing.gap34, spacing.pdStatusBar, spacing.pdBottomBar, layout.flex1]}>
      <DietPlanScreenHeader />
      <DietPlanContentTabs />
    </View>
  );
};

export default MyDietPlanScreen;
