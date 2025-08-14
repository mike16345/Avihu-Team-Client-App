import { RefreshControl, ScrollView, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useEffect, useMemo, useState } from "react";
import { IWorkoutPlan } from "@/interfaces/Workout";
import MuscleGroupContainer from "@/components/WorkoutPlan/new/MuscleGroupContainer";
import TipsModal from "@/components/ui/modals/TipsModal";
import useWorkoutPlanQuery from "@/hooks/queries/useWorkoutPlanQuery";
import { ItemType } from "react-native-dropdown-picker";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import WorkoutPlanSkeletonLoader from "@/components/ui/loaders/skeletons/WorkoutPlanSkeletonLoader";
import ErrorScreen from "./ErrorScreen";
import usePullDownToRefresh from "@/hooks/usePullDownToRefresh";
import WorkoutPlanSelector from "@/components/WorkoutPlan/new/WorkoutPlanSelector";
import { CARDIO_VALUE } from "@/constants/Constants";
import CardioWrapper from "@/components/WorkoutPlan/cardio/CardioWrapper";

const MyWorkoutPlanScreen = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { refresh } = usePullDownToRefresh();

  const { data, isError, isLoading, refetch, isRefetching } = useWorkoutPlanQuery();

  const [selectedPlan, setSelectedPlan] = useState<IWorkoutPlan>();
  const [showCardio, setShowCardio] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [tips, setTips] = useState();
  const [plans, setPlans] = useState<ItemType<string>[]>();

  const handleSelect = (val: any) => {
    if (val == CARDIO_VALUE) {
      setShowCardio(true);

      return;
    }

    const selected = data?.workoutPlans.find((plan) => plan._id === val);

    setSelectedPlan(selected);

    if (!showCardio) return;

    setShowCardio(false);
  };

  useEffect(() => {
    if (!data) return;

    const plans = data.workoutPlans.map((p) => {
      return { label: p.planName, value: p._id };
    });

    plans.push({ label: CARDIO_VALUE, value: CARDIO_VALUE });

    setPlans(plans);
    setSelectedPlan(data.workoutPlans[0]);
    setTips([...data.tips, data.cardio.plan.tips]);
  }, [data]);

  if (isError)
    return <ErrorScreen refetchFunc={() => refresh(refetch)} isFetching={isRefetching} />;
  if (isLoading) return <WorkoutPlanSkeletonLoader />;

  return (
    <>
      <View
        style={[
          colors.background,
          layout.flex1,
          spacing.pdStatusBar,
          spacing.pdBottomBar,
          spacing.gapLg,
        ]}
      >
        <ConditionalRender condition={plans && selectedPlan}>
          <WorkoutPlanSelector
            plans={plans || []}
            handleSelect={handleSelect}
            selectedPlan={showCardio ? CARDIO_VALUE : selectedPlan?.planName || ""}
            tips={data?.tips || []}
          />
        </ConditionalRender>

        <ScrollView
          style={[{ zIndex: -1 }, layout.flex1]}
          contentContainerStyle={[spacing.gapXxl, spacing.pdBottomBar, spacing.pdLg]}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refresh(refetch)} />
          }
        >
          <ConditionalRender condition={showCardio}>
            <CardioWrapper cardioPlan={data.cardio} />
          </ConditionalRender>

          <ConditionalRender condition={!showCardio}>
            {selectedPlan?.muscleGroups.map((muscleGroup, i) => (
              <MuscleGroupContainer key={i} muscleGroup={muscleGroup} />
            ))}
          </ConditionalRender>
        </ScrollView>
      </View>

      <TipsModal tips={tips} visible={showTips} onDismiss={() => setShowTips(false)} />
    </>
  );
};

export default MyWorkoutPlanScreen;
