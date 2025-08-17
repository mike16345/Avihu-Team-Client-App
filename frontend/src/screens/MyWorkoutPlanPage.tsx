import { RefreshControl, ScrollView, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useEffect, useState } from "react";
import { IWorkoutPlan } from "@/interfaces/Workout";
import MuscleGroupContainer from "@/components/WorkoutPlan/MuscleGroupContainer";
import useWorkoutPlanQuery from "@/hooks/queries/useWorkoutPlanQuery";
import { ItemType } from "react-native-dropdown-picker";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import WorkoutPlanSkeletonLoader from "@/components/ui/loaders/skeletons/WorkoutPlanSkeletonLoader";
import ErrorScreen from "./ErrorScreen";
import usePullDownToRefresh from "@/hooks/usePullDownToRefresh";
import WorkoutPlanSelector from "@/components/WorkoutPlan/WorkoutPlanSelector";
import { CARDIO_VALUE } from "@/constants/Constants";
import CardioWrapper from "@/components/WorkoutPlan/cardio/CardioWrapper";

const MyWorkoutPlanScreen = () => {
  const { colors, layout, spacing } = useStyles();
  const { refresh } = usePullDownToRefresh();

  const { data, isError, isLoading, refetch, isRefetching } = useWorkoutPlanQuery();

  const [selectedPlan, setSelectedPlan] = useState<IWorkoutPlan>();
  const [showCardio, setShowCardio] = useState(false);
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
  }, [data]);

  if (isError)
    return <ErrorScreen refetchFunc={() => refresh(refetch)} isFetching={isRefetching} />;

  if (isLoading) return <WorkoutPlanSkeletonLoader />;

  return (
    <>
      <View style={[colors.background, layout.flex1, spacing.pdStatusBar, spacing.gapLg]}>
        <ConditionalRender condition={plans && selectedPlan}>
          <View style={[{ zIndex: 1 }, spacing.pdHorizontalLg]}>
            <WorkoutPlanSelector
              plans={plans || []}
              handleSelect={handleSelect}
              selectedPlan={showCardio ? CARDIO_VALUE : selectedPlan?.planName || ""}
              tips={showCardio ? [data.cardio.plan.tips] : data.tips}
            />
          </View>
        </ConditionalRender>

        <ScrollView
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
    </>
  );
};

export default MyWorkoutPlanScreen;
