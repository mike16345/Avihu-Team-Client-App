import DietPlanContentTabs from "@/components/DietPlan/DietPlanContentTabs";
import DietPlanScreenHeader from "@/components/DietPlan/DietPlanScreenHeader";
import DietPlanSkeleton from "@/components/ui/loaders/skeletons/DietPlanSkeleton";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
import ErrorScreen from "@/screens/ErrorScreen";
import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";

const MyDietPlanScreen = () => {
  const { spacing, layout } = useStyles();
  const { error, isError, isFetching, isLoading, refetch } = useDietPlanQuery();

  if (isError && error?.status !== 404) {
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
